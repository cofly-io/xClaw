; xClaw Desktop NSIS installer.
; Driven by desktop/build.py via:
;   makensis /DXCLAW_VERSION=x.y.z /DUNPACKED=dist\xClaw /DOUTPUT_EXE=dist\xClaw-Setup-x.y.z.exe desktop\xclaw.nsi

Unicode true

!include "MUI2.nsh"
!define MUI_ABORTWARNING

!ifndef XCLAW_VERSION
  !define XCLAW_VERSION "0.0.0"
!endif
!ifndef UNPACKED
  !define UNPACKED "dist\xClaw"
!endif
!ifndef OUTPUT_EXE
  !define OUTPUT_EXE "dist\xClaw-Setup-${XCLAW_VERSION}.exe"
!endif

; Icon (spec puts desktop/icon.ico into dist/xClaw/icon.ico via datas)
!define MUI_ICON "${UNPACKED}\icon.ico"
!define MUI_UNICON "${UNPACKED}\icon.ico"

; Max compression (LZMA solid). This is what shrinks ~870MB dist to ~500MB exe.
SetCompressor /SOLID /FINAL lzma
SetCompressorDictSize 64

Name "xClaw"
OutFile "${OUTPUT_EXE}"
; User-level install. No UAC elevation required.
InstallDir "$LOCALAPPDATA\xClaw"
InstallDirRegKey HKCU "Software\xClaw" "InstallPath"
RequestExecutionLevel user

Var StartMenuFolder

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "HKCU"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "Software\xClaw"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "StartMenuFolder"
!insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\xClaw.exe"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "English"

; Install
Section "xClaw" SecMain
  SectionIn RO
  SetOutPath "$INSTDIR"
  ; Recursively include everything under dist/xClaw/
  File /r "${UNPACKED}\*.*"

  WriteRegStr HKCU "Software\xClaw" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\xClaw" "Version" "${XCLAW_VERSION}"

  ; Add/Remove Programs entry (HKCU, per-user install)
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "DisplayName" "xClaw"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "DisplayVersion" "${XCLAW_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "DisplayIcon" "$INSTDIR\xClaw.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "Publisher" "supOS"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw" "NoRepair" 1

  WriteUninstaller "$INSTDIR\Uninstall.exe"

  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\xClaw.lnk" "$INSTDIR\xClaw.exe" "" "$INSTDIR\xClaw.exe" 0
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\Uninstall xClaw.lnk" "$INSTDIR\Uninstall.exe"
  !insertmacro MUI_STARTMENU_WRITE_END

  CreateShortcut "$DESKTOP\xClaw.lnk" "$INSTDIR\xClaw.exe" "" "$INSTDIR\xClaw.exe" 0
SectionEnd

; Uninstall
Section "Uninstall"
  !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
  Delete "$SMPROGRAMS\$StartMenuFolder\xClaw.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall xClaw.lnk"
  RMDir  "$SMPROGRAMS\$StartMenuFolder"

  Delete "$DESKTOP\xClaw.lnk"

  ; Remove install directory (does NOT touch user data under ~/.copaw)
  RMDir /r "$INSTDIR"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\xClaw"
  DeleteRegKey HKCU "Software\xClaw"
SectionEnd
