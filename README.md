esafety
=======

How to Run our website.

1. Publish website.
  $ ./publish 
  It would copy src into release/website with source code stripped.

2. Run website.
  $ release/start.bat
  The bat would set PYTHONHOME and add python path to system path first, and then start httpd server.

3. Now you can visit the website via http://localhost/etraining
