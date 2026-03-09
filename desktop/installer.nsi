; supOS X 个人助手 - NSIS 安装脚本
; 需要安装 NSIS: https://nsis.sourceforge.io/

!include "MUI2.nsh"

; ─── 基本信息 ───
Name "supOS X 个人助手"
OutFile "supOS-X-Setup.exe"
InstallDir "$LOCALAPPDATA\supOS X"
RequestExecutionLevel user

; ─── UI 配置 ───
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_ABORTWARNING

; ─── 页面 ───
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; ─── 语言 ───
!insertmacro MUI_LANGUAGE "SimpChinese"

; ─── 安装 ───
Section "Install"
    SetOutPath "$INSTDIR"

    ; 复制所有文件
    File /r "dist\supOS X\*.*"

    ; 创建桌面快捷方式
    CreateShortCut "$DESKTOP\supOS X 个人助手.lnk" "$INSTDIR\supOS X.exe" "" "$INSTDIR\supOS X.exe" 0

    ; 创建开始菜单
    CreateDirectory "$SMPROGRAMS\supOS X"
    CreateShortCut "$SMPROGRAMS\supOS X\supOS X 个人助手.lnk" "$INSTDIR\supOS X.exe" "" "$INSTDIR\supOS X.exe" 0
    CreateShortCut "$SMPROGRAMS\supOS X\卸载.lnk" "$INSTDIR\uninstall.exe"

    ; 写卸载程序
    WriteUninstaller "$INSTDIR\uninstall.exe"

    ; 写注册表（添加/删除程序）
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\supOS X" "DisplayName" "supOS X 个人助手"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\supOS X" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\supOS X" "DisplayIcon" "$INSTDIR\supOS X.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\supOS X" "Publisher" "xClaw"
SectionEnd

; ─── 卸载 ───
Section "Uninstall"
    ; 删除文件
    RMDir /r "$INSTDIR"

    ; 删除快捷方式
    Delete "$DESKTOP\supOS X 个人助手.lnk"
    RMDir /r "$SMPROGRAMS\supOS X"

    ; 删除注册表
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\supOS X"
SectionEnd
