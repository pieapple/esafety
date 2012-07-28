esafety
=======

How to Run our website.

1. Publish website.
  $ ./publish 
  It would copy src into release/website with source code stripped.

2. Generate Installer.
2.1 Download and install NSIS 2.46 from http://nsis.sourceforge.net/Download
2.2 Compile esafety.nsi to generate esafety.1.0.exe.

3. Install website and start Website by clicking desktop link
The bat would set PYTHONHOME and add python path to system path first, and then start httpd server.

4. Now you can visit the website via http://localhost/etraining
