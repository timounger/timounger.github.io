//! Create an Excel print report (PrintReport.xlsx) from a PrintLog.csv, modelled
//! on the reference project's excel_print_report.py (Rust port via rust_xlsxwriter).
//!
//! Sheets: print log, summary, article bar chart, cash report, tool info. Run as:
//!     excel_report <print_log.csv> <out.xlsx> [articles.ini]

use std::collections::BTreeMap;
use std::env;
use std::fs;

use rust_xlsxwriter::{
    Chart, ChartType, Color, Format, FormatBorder, Formula, IntoExcelData, Workbook, Worksheet, XlsxError,
};

const UNIT: &str = "EUR";
const NUM_EUR: &str = "#,##0.00 \"EUR\"";
const NUM_PERCENT: &str = "0%";
const FONT_NAME: &str = "Consolas";
const FONT_SIZE: f64 = 11.0;
const MIN_COLUMNS: usize = 8;
/// Cash denominations for the counting sheet (EUR).
const CASH_VALUES: [f64; 15] = [
    500.0, 200.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.0, 1.0, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01,
];
const GROUP_LABELS: [&str; 3] = ["Getränke", "Speisen", "Sonstiges"];

/// One printed article line from the log.
struct Item {
    amount: i64,
    name: String,
    pos: String,
    group: usize,
    total: f64,
    user: String,
    date: String,
    port: String,
}

/// Per-group accumulator (sum plus article -> count).
#[derive(Default, Clone)]
struct Group {
    sum: f64,
    sales: BTreeMap<String, i64>,
}

/// Builds an empty set of three tax groups.
fn groups() -> [Group; 3] {
    [Group::default(), Group::default(), Group::default()]
}

/// Aggregated report data.
struct Agg {
    user_items: BTreeMap<String, [Group; 3]>,
    total_items: [Group; 3],
    free_items: [Group; 3],
    printed_articles: BTreeMap<String, i64>,
    group_sums: [f64; 3],
    min_date: Option<String>,
    max_date: Option<String>,
}

/// Builds a cell format from style flags.
fn fmt(bold: bool, border: bool, num: Option<&str>, fill: Option<u32>) -> Format {
    let mut format = Format::new().set_font_name(FONT_NAME).set_font_size(FONT_SIZE);
    if bold {
        format = format.set_bold();
    }
    if border {
        format = format.set_border(FormatBorder::Thin);
    }
    if let Some(number_format) = num {
        format = format.set_num_format(number_format);
    }
    if let Some(color) = fill {
        format = format.set_background_color(Color::RGB(color));
    }
    format
}

/// Writes a value at 1-based Excel coordinates (matching the reference layout).
fn cell<T: IntoExcelData>(ws: &mut Worksheet, row: u32, col: u16, value: T, format: &Format) -> Result<(), XlsxError> {
    ws.write_with_format(row - 1, col - 1, value, format)?;
    Ok(())
}

/// Writes a formula at 1-based Excel coordinates.
fn formula(ws: &mut Worksheet, row: u32, col: u16, value: &str, format: &Format) -> Result<(), XlsxError> {
    ws.write_formula_with_format(row - 1, col - 1, Formula::new(value), format)?;
    Ok(())
}

/// Reads the print log CSV into items (skips the header and malformed rows).
fn read_items(path: &str) -> Vec<Item> {
    let mut items = Vec::new();
    let Ok(text) = fs::read_to_string(path) else {
        return items;
    };
    for (i, line) in text.lines().enumerate() {
        if i == 0 || line.is_empty() {
            continue;
        }
        let cols: Vec<&str> = line.split(';').collect();
        if cols.len() < MIN_COLUMNS {
            continue;
        }
        let (Ok(amount), Ok(total)) = (cols[0].trim().parse::<i64>(), cols[4].trim().parse::<f64>()) else {
            continue;
        };
        let mut group = cols[3].trim().parse::<usize>().unwrap_or(3);
        if group != 1 && group != 2 {
            group = 3;
        }
        items.push(Item {
            amount,
            name: cols[1].to_string(),
            pos: cols[2].to_string(),
            group,
            total,
            user: cols[5].to_string(),
            date: cols[6].to_string(),
            port: cols[7].to_string(),
        });
    }
    items
}

/// Reads the key/value entries of a named INI section (e.g. [Tax]).
fn read_section(path: &str, section: &str) -> BTreeMap<String, String> {
    let mut map = BTreeMap::new();
    let Ok(text) = fs::read_to_string(path) else {
        return map;
    };
    let target = format!("[{}]", section.to_lowercase());
    let mut in_section = false;
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with(';') {
            continue;
        }
        if trimmed.starts_with('[') && trimmed.ends_with(']') {
            in_section = trimmed.to_lowercase() == target;
        } else if in_section {
            if let Some((key, value)) = trimmed.split_once('=') {
                map.insert(key.trim().to_lowercase(), value.trim().to_string());
            }
        }
    }
    map
}

/// Parses a tax percentage from the [Tax] section.
fn tax_percent(tax: &BTreeMap<String, String>, key: &str) -> f64 {
    tax.get(key).and_then(|v| v.parse::<f64>().ok()).unwrap_or(0.0)
}

/// Aggregates items per user/group and per article (storno nets out).
fn aggregate(items: &[Item]) -> Agg {
    let mut agg = Agg {
        user_items: BTreeMap::new(),
        total_items: groups(),
        free_items: groups(),
        printed_articles: BTreeMap::new(),
        group_sums: [0.0; 3],
        min_date: None,
        max_date: None,
    };
    for item in items {
        let count = if item.total >= 0.0 { item.amount } else { -item.amount };
        let idx = item.group - 1;
        agg.min_date = Some(match &agg.min_date {
            Some(d) if d.as_str() <= item.date.as_str() => d.clone(),
            _ => item.date.clone(),
        });
        agg.max_date = Some(match &agg.max_date {
            Some(d) if d.as_str() >= item.date.as_str() => d.clone(),
            _ => item.date.clone(),
        });
        agg.group_sums[idx] += item.total;
        if item.user != "Free" {
            let entry = agg.user_items.entry(item.user.clone()).or_insert_with(groups);
            *entry[idx].sales.entry(item.name.clone()).or_insert(0) += count;
            entry[idx].sum += item.total;
            *agg.total_items[idx].sales.entry(item.name.clone()).or_insert(0) += count;
            agg.total_items[idx].sum += item.total;
        } else {
            *agg.free_items[idx].sales.entry(item.name.clone()).or_insert(0) += count;
        }
    }
    for group in &agg.total_items {
        for (name, count) in &group.sales {
            *agg.printed_articles.entry(name.clone()).or_insert(0) += count;
        }
    }
    agg
}

/// Formats per-group sales lines for the summary sheet.
fn group_summary_lines(group_dict: &[Group; 3], print_values: bool, lines: &mut Vec<String>) {
    for (idx, group) in group_dict.iter().enumerate() {
        if group.sum != 0.0 || !group.sales.is_empty() {
            if print_values {
                lines.push(format!("* Gruppe {}: {:.2} {UNIT}", idx + 1, group.sum));
            } else {
                lines.push(format!("* Gruppe {}:", idx + 1));
            }
        }
        for (name, count) in &group.sales {
            lines.push(format!("  {count} x {name}"));
        }
    }
}

/// Builds the summary text lines (totals, per user, free articles).
fn build_summary(agg: &Agg, involvement: f64) -> Vec<String> {
    let mut lines = vec!["Bericht".to_string(), String::new()];
    if let (Some(min), Some(max)) = (&agg.min_date, &agg.max_date) {
        lines.push(format!("Von: {min}"));
        lines.push(format!("Bis: {max}"));
    }
    lines.push(String::new());
    let total: f64 = agg.total_items.iter().map(|g| g.sum).sum();
    lines.push("Gesamtverkäufe".to_string());
    lines.push(format!("Summe: {total:.2} {UNIT}"));
    group_summary_lines(&agg.total_items, true, &mut lines);
    lines.push(String::new());
    lines.push("Verkäufe pro Benutzer".to_string());
    for (user, user_groups) in &agg.user_items {
        let user_sum: f64 = user_groups.iter().map(|g| g.sum).sum();
        lines.push(format!("# {user}"));
        lines.push(format!("Summe: {user_sum:.2} {UNIT}"));
        if !user.starts_with("Local") && involvement != 0.0 {
            let share = user_sum * (involvement / 100.0);
            lines.push(format!("Beteiligung: {share:.2} {UNIT} ({involvement} %)"));
            lines.push(format!("Auszahlung: {:.2} {UNIT}", user_sum - share));
        }
        group_summary_lines(user_groups, true, &mut lines);
    }
    if agg.free_items.iter().any(|g| !g.sales.is_empty()) {
        lines.push(String::new());
        lines.push("Gratis-Artikel".to_string());
        group_summary_lines(&agg.free_items, false, &mut lines);
    }
    lines
}

/// Creates the print-log table sheet.
fn create_print_log_sheet(ws: &mut Worksheet, items: &[Item]) -> Result<(), XlsxError> {
    ws.set_name("Druckprotokoll")?;
    ws.set_tab_color(Color::RGB(0x00B050));
    ws.set_freeze_panes(1, 0)?;
    let header = [
        "Anzahl",
        "Artikelname",
        "Artikelnummer",
        "Gruppe",
        "Preis",
        "Gesamtpreis",
        "Benutzer",
        "Datum",
        "Drucker",
    ];
    let head = fmt(true, true, None, None);
    let border = fmt(false, true, None, None);
    let eur = fmt(false, true, Some(NUM_EUR), None);
    for (i, heading) in header.iter().enumerate() {
        cell(ws, 1, (i + 1) as u16, *heading, &head)?;
    }
    for (i, item) in items.iter().enumerate() {
        let row = (i + 2) as u32;
        cell(ws, row, 1, item.amount, &border)?;
        cell(ws, row, 2, item.name.as_str(), &border)?;
        cell(ws, row, 3, item.pos.as_str(), &border)?;
        cell(ws, row, 4, item.group as i64, &border)?;
        formula(ws, row, 5, &format!("=(F{row}/A{row})"), &eur)?;
        cell(ws, row, 6, item.total, &eur)?;
        cell(ws, row, 7, item.user.as_str(), &border)?;
        cell(ws, row, 8, item.date.as_str(), &border)?;
        cell(ws, row, 9, item.port.as_str(), &border)?;
    }
    for (col, width) in [6.0, 18.0, 12.0, 7.0, 10.0, 12.0, 10.0, 22.0, 8.0].iter().enumerate() {
        ws.set_column_width(col as u16, *width)?;
    }
    Ok(())
}

/// Creates the summary text sheet.
fn create_summary_sheet(ws: &mut Worksheet, lines: &[String]) -> Result<(), XlsxError> {
    ws.set_tab_color(Color::RGB(0x000000));
    let bold = fmt(true, false, None, None);
    let plain = fmt(false, false, None, None);
    for (i, line) in lines.iter().enumerate() {
        let is_heading = !line.is_empty() && !line.starts_with([' ', '*', '#']);
        cell(ws, (i + 1) as u32, 1, line.as_str(), if is_heading { &bold } else { &plain })?;
    }
    ws.set_column_width(0, 50.0)?;
    Ok(())
}

/// Creates the article count bar-chart sheet.
fn create_article_chart_sheet(ws: &mut Worksheet, printed_articles: &BTreeMap<String, i64>) -> Result<(), XlsxError> {
    ws.set_tab_color(Color::RGB(0xFFA500));
    let head = fmt(true, true, None, None);
    let border = fmt(false, true, None, None);
    cell(ws, 1, 1, "Artikel", &head)?;
    cell(ws, 1, 2, "Drucke", &head)?;
    cell(ws, 2, 1, "Summe", &head)?;
    let mut sorted: Vec<(&String, &i64)> = printed_articles.iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(a.1));
    let mut row = 2u32;
    for (name, count) in sorted {
        row += 1;
        cell(ws, row, 1, name.as_str(), &border)?;
        cell(ws, row, 2, *count, &border)?;
    }
    formula(ws, 2, 2, &format!("=SUM(B3:B{row})"), &head)?;
    if row >= 3 {
        let last = row - 1; // 0-based last data row
        let mut chart = Chart::new(ChartType::Column);
        chart.add_series().set_categories(("Artikel", 2, 0, last, 0)).set_values(("Artikel", 2, 1, last, 1));
        chart.title().set_name("Gedruckte Artikel");
        chart.legend().set_hidden();
        chart.set_width(480).set_height(288);
        ws.insert_chart(0, 3, &chart)?;
    }
    ws.set_column_width(0, 18.0)?;
    ws.set_column_width(1, 8.0)?;
    Ok(())
}

/// Creates the cash counting + group gross/net/tax sheet.
fn create_cash_report_sheet(ws: &mut Worksheet, group_values: &[[f64; 2]; 3]) -> Result<(), XlsxError> {
    ws.set_tab_color(Color::RGB(0xFF0000));
    let bold = fmt(true, false, None, None);
    let head = fmt(true, true, None, None);
    let border = fmt(false, true, None, None);
    let eur = fmt(false, true, Some(NUM_EUR), None);
    let eur_bold = fmt(true, true, Some(NUM_EUR), None);
    let pct = fmt(false, true, Some(NUM_PERCENT), None);
    cell(ws, 1, 1, "Anfang", &bold)?;
    cell(ws, 1, 5, "Ende", &bold)?;
    for (i, heading) in ["Kassenwert", "Anzahl", "Summe"].iter().enumerate() {
        cell(ws, 3, (i + 1) as u16, *heading, &head)?;
        cell(ws, 3, (i + 5) as u16, *heading, &head)?;
    }
    for (i, cash) in CASH_VALUES.iter().enumerate() {
        let cash_row = (i + 4) as u32;
        cell(ws, cash_row, 1, *cash, &eur)?;
        cell(ws, cash_row, 5, *cash, &eur)?;
        cell(ws, cash_row, 2, 0, &border)?;
        cell(ws, cash_row, 6, 0, &border)?;
        formula(ws, cash_row, 3, &format!("=(A{cash_row}*B{cash_row})"), &eur)?;
        formula(ws, cash_row, 7, &format!("=(E{cash_row}*F{cash_row})"), &eur)?;
    }
    cell(ws, 19, 1, "Summe", &head)?;
    cell(ws, 19, 5, "Summe", &head)?;
    formula(ws, 19, 3, "=SUM(C4:C18)", &eur_bold)?;
    formula(ws, 19, 7, "=SUM(G4:G18)", &eur_bold)?;
    cell(ws, 21, 1, "Bargeld", &border)?;
    formula(ws, 21, 2, "=(G19-C19)", &eur)?;
    cell(ws, 22, 1, "Gezählt Druck", &border)?;
    formula(ws, 22, 2, "=SUM(B26:B28)", &eur)?;
    cell(ws, 23, 1, "Differenz", &border)?;
    formula(ws, 23, 2, "=IF(OR(C19<>0,G19<>0),(B21-B22),0)", &eur)?;
    for (i, heading) in ["", "Brutto", "Netto", "Steuersatz", "Steuer"].iter().enumerate() {
        cell(ws, 25, (i + 1) as u16, *heading, &head)?;
    }
    for (i, values) in group_values.iter().enumerate() {
        let report_row = (26 + i) as u32;
        cell(ws, report_row, 1, format!("Gruppe {} {}", i + 1, GROUP_LABELS[i]), &border)?;
        cell(ws, report_row, 2, values[0], &eur)?;
        formula(ws, report_row, 3, &format!("=(B{report_row}/(1+D{report_row}))"), &eur)?;
        cell(ws, report_row, 4, values[1] / 100.0, &pct)?;
        formula(ws, report_row, 5, &format!("=(B{report_row}-C{report_row})"), &eur)?;
    }
    cell(ws, 30, 1, "Summe", &head)?;
    formula(ws, 30, 2, "=SUM(B26:B29)", &fmt(true, true, Some(NUM_EUR), Some(0x92D050)))?;
    formula(ws, 30, 5, "=SUM(E26:E29)", &eur_bold)?;
    for (col, width) in [20.0, 16.0, 16.0, 14.0, 20.0, 16.0, 16.0].iter().enumerate() {
        ws.set_column_width(col as u16, *width)?;
    }
    Ok(())
}

/// Creates the hidden tool-info sheet.
fn create_tool_info_sheet(ws: &mut Worksheet) -> Result<(), XlsxError> {
    ws.set_hidden(true);
    let plain = fmt(false, false, None, None);
    let bold = fmt(true, false, None, None);
    cell(ws, 1, 1, "Dieser Bericht wurde mit BonPrinter erstellt.", &plain)?;
    cell(ws, 3, 1, "BonPrinter", &bold)?;
    cell(ws, 4, 1, "BonPrinter - Thermal printer tool", &plain)?;
    ws.set_column_width(0, 60.0)?;
    Ok(())
}

/// Builds the whole workbook and saves it.
fn build(items: &[Item], tax: &BTreeMap<String, String>, out_path: &str) -> Result<(), XlsxError> {
    let agg = aggregate(items);
    let involvement = tax_percent(tax, "user");
    let group_values: [[f64; 2]; 3] = [
        [agg.group_sums[0], tax_percent(tax, "group1")],
        [agg.group_sums[1], tax_percent(tax, "group2")],
        [agg.group_sums[2], tax_percent(tax, "group3")],
    ];
    let summary = build_summary(&agg, involvement);

    let mut workbook = Workbook::new();
    create_print_log_sheet(workbook.add_worksheet(), items)?;
    create_summary_sheet(workbook.add_worksheet().set_name("Übersicht")?, &summary)?;
    if !agg.printed_articles.is_empty() {
        create_article_chart_sheet(workbook.add_worksheet().set_name("Artikel")?, &agg.printed_articles)?;
        create_cash_report_sheet(workbook.add_worksheet().set_name("Kassenbericht")?, &group_values)?;
    }
    create_tool_info_sheet(workbook.add_worksheet().set_name("ToolInfo")?)?;
    workbook.save(out_path)?;
    Ok(())
}

/// Reads the CSV + config and writes the Excel report.
fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("usage: excel_report <print_log.csv> <out.xlsx> [articles.ini]");
        return;
    }
    let items = read_items(&args[1]);
    let tax = args.get(3).map(|p| read_section(p, "Tax")).unwrap_or_default();
    if let Err(error) = build(&items, &tax, &args[2]) {
        eprintln!("excel report failed: {error}");
        std::process::exit(1);
    }
    println!("Excel report written: {}", args[2]);
}
