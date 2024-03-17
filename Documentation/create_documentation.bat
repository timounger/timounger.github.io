:: create Doxygen documentation
cd ..
cd Documentation/DoxygenCreator
rmdir /s/q "Output_Doxygen"
python doxygen_creator.py -o True
#pause
