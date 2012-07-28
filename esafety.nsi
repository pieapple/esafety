;--------------------------------
;Include

  !include "MUI2.nsh"
  !include "LogicLib.nsh"

;--------------------------------
;General

  !define PRODUCT_NAME "企业安全生产标准化信息管理系统"
  !define PRODUCT_VERSION "1.0"
  !define PRODUCT_PUBLISHER "pieapple && snakeqing23"
  !define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  !define PRODUCT_UNINST_ROOT_KEY "HKLM"

  ;Request application privileges for Windows Vista
  RequestExecutionLevel admin

;--------------------------------
;Interface Settings

  !define MUI_ABORTWARNING

;--------------------------------
;Pages

  ; Welcome page
  !insertmacro MUI_PAGE_WELCOME
  ; License page
  !insertmacro MUI_PAGE_LICENSE "license.txt"
  ; Components page
  !insertmacro MUI_PAGE_COMPONENTS
  ; Directory page
  !insertmacro MUI_PAGE_DIRECTORY
  ; Instfiles page
  !insertmacro MUI_PAGE_INSTFILES
  ; Finish page
  !define MUI_FINISHPAGE_RUN "$INSTDIR\start.bat"
  !insertmacro MUI_PAGE_FINISH

  !insertmacro MUI_UNPAGE_WELCOME
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  !insertmacro MUI_UNPAGE_FINISH

;--------------------------------
;Languages

  !insertmacro MUI_LANGUAGE "SimpChinese"
  DirText "安装程序将安装 $(^NameDA) 在下列文件夹。要安装到不同文件夹，单击 [浏览(B)] 并选择其他的文件夹。 $_CLICK" 

;--------------------------------
;Reserve Files
  
  ;If you are using solid compression, files that are required before
  ;the actual installation should be stored first in the data block,
  ;because this will make your installer start faster.
  
  !insertmacro MUI_RESERVEFILE_LANGDLL

;--------------------------------
;Installer Sections

  Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
  OutFile "esafety.${PRODUCT_VERSION}.exe"
  InstallDir "$PROGRAMFILES\esafety"
  BrandingText "Made by pieapple"

  Section "主程序 (必需的)" SEC_PROGRAM
    SectionIn RO
    SetOverwrite on
    SetOutPath "$INSTDIR"
    File release\start.bat
    File /r /x *.pyc /x *.pyo "release\Python27"
    File /r "release\Apache2.2"
    File /r "release\website"
    File /r "release\start.bat"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\esafety" "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\esafety" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\esafety" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\esafety" "NoRepair" 1
    WriteUninstaller "Uninstall.exe"
  SectionEnd

  SectionGroup /e "快捷方式" SECGRP_SHORTCUT
    Section "桌面" SEC_DESKTOP
      CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\start.bat"
    SectionEnd
    Section "开始菜单" SEC_SMPROGRAMS
      CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
      CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\启动系统.lnk" "$INSTDIR\start.bat"
      CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\卸载程序.lnk" "$INSTDIR\Uninstall.exe"
    SectionEnd
  SectionGroupEnd

;--------------------------------
;Installer Functions

Var "IpAddress"
Var "MacAddress"

Function .GetMacAddress
  Push $0
  Ip::get_ip
  Pop $0
  StrCpy $IpAddress $0 -1
 
  IpConfig::GetNetworkAdapterIDFromIPAddress $IpAddress
  Pop $1
  Pop $2
  ${If} $1 == "ok"
    IpConfig::GetNetworkAdapterMACAddress $2
    Pop $3
    Pop $MacAddress
  ${Else}
    Strcpy $MacAddress ""
  ${EndIf}

FunctionEnd

Function .onInit

  call .GetMacAddress
  ${If} $MacAddress S!= "60:D8:19:D3:AD:9A"
    MessageBox MB_OK "安装失败! 未获得软件授权。请获得授权后，使用新的安装程序重新安装。"
    Abort
  ${EndIf}
  
FunctionEnd

;--------------------------------
;Version Information

  VIProductVersion "1.2.3.4"
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "ProductName" ${PRODUCT_NAME}
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "Comments" ""
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "CompanyName" "pieapple && snakeqing"
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "LegalTrademarks" ""
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "LegalCopyright" ""
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "FileDescription" ""
  VIAddVersionKey /LANG=${LANG_SIMPCHINESE} "FileVersion" ${PRODUCT_VERSION} 

;--------------------------------
;Descriptions

  ;USE A LANGUAGE STRING IF YOU WANT YOUR DESCRIPTIONS TO BE LANGAUGE SPECIFIC

  ;Assign descriptions to sections
  !insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC_PROGRAM} ${PRODUCT_NAME}
    !insertmacro MUI_DESCRIPTION_TEXT ${SECGRP_SHORTCUT} "快捷方式"
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC_DESKTOP} "桌面快捷方式"
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC_SMPROGRAMS} "开始菜单快捷方式"
  !insertmacro MUI_FUNCTION_DESCRIPTION_END
 
;--------------------------------
;Uninstaller Section

Section "Uninstall"

  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\esafety"

  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"

SectionEnd

;--------------------------------
;Uninstaller Functions

Function un.onInit

  !insertmacro MUI_UNGETLANGUAGE
  
FunctionEnd

