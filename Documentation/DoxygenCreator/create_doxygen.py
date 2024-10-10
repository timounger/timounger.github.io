"""!
********************************************************************************
 @file    create_doxygen.py
 @brief   create doxygen documentation for project
********************************************************************************
"""

# autopep8: off
import sys
import os
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from Documentation.DoxygenCreator.doxygen_creator import DoxygenCreator, get_cmd_args, S_MAIN_FOLDER_FOLDER, S_PYTHON_PATTERN, NO, YES  # pylint: disable=wrong-import-position
# autopep8: on

if __name__ == "__main__":
    args = get_cmd_args()
    s_repo = None
    doxygen_creator = DoxygenCreator(s_repo)
    logo_path = "Documentation/img/logo.png"
    logo_small_path = "Documentation/img/favicon.png"
    doxygen_creator = DoxygenCreator(f"{S_MAIN_FOLDER_FOLDER}{logo_path}")
    doxygen_creator.set_configuration("PROJECT_NAME", "Timo Unger")
    #doxygen_creator.set_configuration("PROJECT_NUMBER", "")
    doxygen_creator.set_configuration("PROJECT_BRIEF", "Software Engineering")
    doxygen_creator.set_configuration("PROJECT_LOGO", f"{S_MAIN_FOLDER_FOLDER}{logo_path}")
    doxygen_creator.set_configuration("PROJECT_ICON", f"{S_MAIN_FOLDER_FOLDER}{logo_small_path}")
    doxygen_creator.set_configuration("INPUT", S_MAIN_FOLDER_FOLDER)
    l_file_pattern = ["*.md"]
    doxygen_creator.set_configuration("FILE_PATTERNS", l_file_pattern)
    doxygen_creator.set_configuration("OUTPUT_LANGUAGE", "GERMAN")
    #doxygen_creator.set_configuration("SEARCHENGINE", NO)

    sys.exit(doxygen_creator.run_doxygen(b_open_doxygen_output=args.open))
