:: create Doxygen documentation
cd ..
cd Documentation/DoxygenCreator
rmdir /s/q "Output_Doxygen"
..\..\.env\Scripts\python create_doxygen.py -o True
::pause
