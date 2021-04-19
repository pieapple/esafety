esafety
=======

How to Run our website.

1. Publish website.
  * `$ ./publish`
  * It would copy src into release/website with source code stripped.

2. Generate Installer.
  * Download and install NSIS 2.46 from http://nsis.sourceforge.net/Download
  * Download and install IP and IPConfig plugin by copying the DLL to NSIS's installation plugin dir. These two plugin are for MAC address retrival.
    * http://nsis.sourceforge.net/IpConfig_plugin
    * http://nsis.sourceforge.net/IP_plug-in
  * Compile esafety.nsi via the context menu to generate esafety.1.0.exe.

3. Install and start Website by clicking desktop link
  * The bat would set PYTHONHOME and add python path to system path first, and then start httpd server.

4. Now you can visit the website via http://<server ip>/etraining
