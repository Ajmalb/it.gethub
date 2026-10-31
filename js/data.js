/**
 * TITAN IT - THE ULTIMATE ENTERPRISE IT & TROUBLESHOOTING ENCYCLOPEDIA
 * DATA REPOSITORY (js/data.js) - EXPANDED & EXHAUSTIVE EDITION
 * Packed with 30+ deep-dive troubleshooting guides across all domains.
 */

const IT_DATABASE = {
  categories: [
    { id: 'all', name: 'All Categories', icon: '⚡' },
    { id: 'windows', name: 'Windows & OS', icon: '🪟' },
    { id: 'enterprise', name: 'Active Directory & M365', icon: '🏢' },
    { id: 'network', name: 'Networking & Connectivity', icon: '🌐' },
    { id: 'linux', name: 'Linux & SysAdmin', icon: '🐧' },
    { id: 'hardware', name: 'Hardware & Diagnostics', icon: '🖥️' },
    { id: 'security', name: 'Cybersecurity & IR', icon: '🛡️' },
    { id: 'commands', name: 'Master Command Vault', icon: '💻' }
  ],

  issues: [
    /* =========================================================================
       CATEGORY 1: WINDOWS & OS
       ========================================================================= */
    {
      id: 'win-bsod-critical-process',
      category: 'windows',
      severity: 'critical',
      title: 'BSoD: CRITICAL_PROCESS_DIED (0x000000EF)',
      errorCode: '0x000000EF / CRITICAL_PROCESS_DIED',
      summary: 'A critical Windows system process (such as csrss.exe, wininit.exe, svchost.exe, or ntoskrnl.exe) terminated unexpectedly, forcing an immediate kernel halt.',
      tags: ['BSoD', 'Crash', 'Kernel', 'Windows 10/11', 'System Process'],
      quickSnippet: 'sfc /scannow && dism /online /cleanup-image /restorehealth',
      quickSnippetLang: 'cmd',
      rootCause: 'System-critical process corruption due to corrupted system files, faulty storage sectors holding vital DLLs, incompatible third-party kernel drivers, or registry corruption.',
      symptoms: [
        'Sudden Blue Screen of Death during normal desktop use or shortly after boot',
        'Stop Code: CRITICAL_PROCESS_DIED',
        'Event Viewer shows BugCheck Event ID 1001 with error code 0x000000ef',
        'System fails to generate a full memory.dmp file in some storage controller crashes'
      ],
      steps: [
        {
          title: 'Boot into Windows Recovery Environment (WinRE)',
          desc: 'Interrupt boot three times or boot via Windows USB installer -> Choose "Troubleshoot" -> "Advanced Options" -> "Command Prompt".'
        },
        {
          title: 'Execute Offline System File Checker & DISM Image Repair',
          desc: 'Verify filesystem integrity against the offline Windows image without loading potentially damaged active drivers.',
          code: 'sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows\n\ndism /image:C:\\ /cleanup-image /restorehealth'
        },
        {
          title: 'Check Disk Drive Health and File System Structure',
          desc: 'Run a thorough chkdsk pass to locate and mark bad sectors on the OS drive.',
          code: 'chkdsk C: /f /r'
        },
        {
          title: 'Uninstall Recent Problematic Windows Cumulative Updates',
          desc: 'If the crash occurred immediately after a Patch Tuesday update, remove the latest package via DISM.',
          code: 'dism /image:C:\\ /get-packages\n\ndism /image:C:\\ /remove-package /packagename:<Package_Identity_Name>'
        },
        {
          title: 'Verify Driver Signature & Run Driver Verifier Reset',
          desc: 'Reset Driver Verifier settings in case a testing flag was left active.',
          code: 'verifier /reset'
        }
      ],
      verification: 'System boots cleanly into standard desktop mode; Event Viewer System log shows Event ID 41 has ceased and DISM reports component store corruption repaired.',
      proTip: 'If CRITICAL_PROCESS_DIED occurs within 30 seconds of cold boot every time, inspect SMART health for NVMe/SSD failing controllers triggering a drive drop from the PCIe bus.'
    },

    {
      id: 'win-bsod-irql',
      category: 'windows',
      severity: 'critical',
      title: 'BSoD: IRQL_NOT_LESS_OR_EQUAL (0x0000000A)',
      errorCode: '0x0000000A / IRQL_NOT_LESS_OR_EQUAL',
      summary: 'A kernel-mode process or driver attempted to access a memory address without valid permission or at an excessively high Interrupt Request Level (IRQL).',
      tags: ['BSoD', 'Crash', 'IRQL', 'Drivers', 'Memory'],
      quickSnippet: 'mdsched.exe (Windows Memory Diagnostic)',
      quickSnippetLang: 'cmd',
      rootCause: 'Buggy or outdated device drivers (frequently audio, Wi-Fi, anti-cheat, or GPU), faulty physical RAM modules, or memory address paging conflict.',
      symptoms: [
        'BSoD citing a specific `.sys` driver filename (e.g., nvlddmkm.sys, netwtw10.sys, or ntoskrnl.exe)',
        'Crashes under heavy network or graphical load',
        'Kernel minidump points to MEMORY_CORRUPTION_ONE_BIT or driver fault'
      ],
      steps: [
        {
          title: 'Inspect BugCheck Parameters in Minidump via WinDbg / BlueScreenView',
          desc: 'Analyze `C:\\Windows\\Minidump\\*.dmp` using WinDbg (`!analyze -v`) to locate the exact crashing module and offending third-party driver.'
        },
        {
          title: 'Update or Roll Back the Flagged Driver',
          desc: 'Boot in Safe Mode with Networking, launch Device Manager, right-click the offending device (Network, GPU, or Sound) -> Update Driver or Roll Back Driver.'
        },
        {
          title: 'Execute Memory Diagnostic to Test Physical RAM Modules',
          desc: 'Check physical RAM for memory errors.',
          code: 'mdsched.exe'
        },
        {
          title: 'Clean Driver State using Display Driver Uninstaller (DDU)',
          desc: 'If GPU driver is implicated, perform a clean wipe in Safe Mode with DDU and reinstall WHQL certified drivers.'
        }
      ],
      verification: 'Minidump generation ceases; memory stress test (MemTest86) passes 4 consecutive cycles without a single address error.',
      proTip: 'If `ntoskrnl.exe` is blamed as the culprit, ntoskrnl is rarely the actual bug—it simply received invalid memory instructions from another rogue driver or unstable RAM timing.'
    },

    {
      id: 'win-bsod-inaccessible-boot',
      category: 'windows',
      severity: 'critical',
      title: 'BSoD: INACCESSIBLE_BOOT_DEVICE (0x0000007B)',
      errorCode: '0x0000007B / INACCESSIBLE_BOOT_DEVICE',
      summary: 'Windows kernel lost access to the system boot partition during startup, commonly following disk clone, SATA/NVMe mode change, or storage driver corruption.',
      tags: ['BSoD', 'Boot Failure', 'Storage', 'AHCI/RAID', 'NVMe'],
      quickSnippet: 'bootrec /fixmbr && bootrec /fixboot && bootrec /rebuildbcd',
      quickSnippetLang: 'cmd',
      rootCause: 'Storage controller driver mismatch (AHCI vs RAID/Intel RST in BIOS), corrupted BCD (Boot Configuration Data), or damaged EFI system partition pointers.',
      symptoms: [
        'Windows logo appears spinning, followed immediately by 0x7B Stop Code',
        'Automatic Repair fails to identify the OS partition',
        'Occurs frequently after switching motherboard BIOS settings or cloning SSDs'
      ],
      steps: [
        {
          title: 'Verify SATA / NVMe Mode in BIOS/UEFI',
          desc: 'Enter UEFI/BIOS (F2/Del). Confirm Storage Mode matches installation: Switch between AHCI and RAID ON (Intel RST/VMD). If Windows was installed under AHCI, booting under RAID triggers this exact crash.'
        },
        {
          title: 'Rebuild BCD from WinRE Command Prompt',
          desc: 'Assign drive letters to the EFI volume and rebuild the boot configuration store.',
          code: 'diskpart\nlist disk\nselect disk 0\nlist volume\nselect volume <EFI_FAT32_VOL_NUM>\nassign letter=S\nexit\n\ncd /d S:\\EFI\\Microsoft\\Boot\\\nbootrec /fixboot\nren BCD BCD.bak\nbcdboot C:\\Windows /l en-us /s S: /f ALL'
        },
        {
          title: 'Enable Safe Mode to Auto-Enumerate Storage Drivers',
          desc: 'Safe mode forces Windows to load standard inbox AHCI/NVMe drivers and update registry start types.',
          code: 'bcdedit /set {default} safeboot minimal'
        }
      ],
      verification: 'System reaches the Windows Login screen in Safe Mode, resets its controller registry bindings, and successfully reboots in normal mode.',
      proTip: 'On Dell/Lenovo machines, Intel VMD (Volume Management Device) enabled in BIOS without the Intel RST driver loaded into the Windows image is the #1 cause of this crash.'
    },

    {
      id: 'win-bitlocker-recovery-loop',
      category: 'windows',
      severity: 'high',
      title: 'BitLocker Prompting for Recovery Key on Every Boot',
      errorCode: 'BitLocker PCR Validation Mismatch / TPM Lockout',
      summary: 'Workstation requests the 48-digit BitLocker recovery key on every single startup, even after the correct key is typed successfully.',
      tags: ['BitLocker', 'Security', 'TPM', 'PCR', 'Encryption'],
      quickSnippet: 'manage-bde -protectors -disable C: && manage-bde -protectors -enable C:',
      quickSnippetLang: 'cmd',
      rootCause: 'TPM Platform Configuration Register (PCR 7 / PCR 11) validation hash change caused by UEFI firmware update, Secure Boot state toggle, or external dock attachment.',
      symptoms: [
        'Blue BitLocker screen asks for recovery key on every cold boot or restart',
        'Entering key unlocks Windows, but next reboot asks for key again',
        'TPM.msc reports "The TPM is ready for use" but PCR banks fail validation'
      ],
      steps: [
        {
          title: 'Suspend BitLocker Protection from Elevated Terminal',
          desc: 'Temporarily pause hardware encryption checks so Windows can re-baseline PCR measurements.',
          code: 'manage-bde -protectors -disable C: -RebootCount 1'
        },
        {
          title: 'Verify and Clear TPM State (If PCR is Desynced)',
          desc: 'Open tpm.msc and confirm TPM 2.0 status. If desynchronized, re-register TPM protector.',
          code: 'manage-bde -protectors -delete C: -type TPM\nmanage-bde -protectors -add C: -tpm'
        },
        {
          title: 'Check Secure Boot Configuration in UEFI',
          desc: 'Ensure Secure Boot is Enabled in BIOS. Disabling Secure Boot invalidates PCR 7 and breaks automatic TPM key release.'
        },
        {
          title: 'Re-enable BitLocker Protectors',
          desc: 'Resume full protection to write new PCR hashes to TPM.',
          code: 'manage-bde -protectors -enable C:'
        }
      ],
      verification: 'Perform 2 full system restarts; machine boots directly into Windows login prompt without requesting the BitLocker recovery key.',
      proTip: 'Always suspend BitLocker (`Suspend-BitLocker -MountPoint "C:" -RebootCount 1`) BEFORE initiating a BIOS/UEFI firmware flash.'
    },

    {
      id: 'win-startup-repair-loop',
      category: 'windows',
      severity: 'critical',
      title: 'Windows Automatic Startup Repair Loop / SrtTrail.txt Error',
      errorCode: 'SrtTrail.txt: Boot critical file is corrupt / Error Code 0x0',
      summary: 'Windows refuses to reach the desktop, continually rebooting into "Automatic Repair couldn\'t repair your PC" pointing to SrtTrail.txt.',
      tags: ['Boot', 'Startup Repair', 'SrtTrail.txt', 'WinRE', 'Registry'],
      quickSnippet: 'type C:\\Windows\\System32\\Logfiles\\Srt\\SrtTrail.txt',
      quickSnippetLang: 'cmd',
      rootCause: 'Corrupt registry software hive (SAM, SYSTEM, SOFTWARE), damaged early-launch anti-malware driver, or dirty bit on volume.',
      symptoms: [
        '"Preparing Automatic Repair" -> "Diagnosing your PC" -> "Your PC did not start correctly"',
        'Log file: C:\\Windows\\System32\\Logfiles\\Srt\\SrtTrail.txt',
        'Normal restart loops right back to the repair menu'
      ],
      steps: [
        {
          title: 'Inspect SrtTrail.txt to Identify Specific Failure Point',
          desc: 'From WinRE Command Prompt, read the repair diagnostic log.',
          code: 'type C:\\Windows\\System32\\Logfiles\\Srt\\SrtTrail.txt | findstr /i "Root cause"'
        },
        {
          title: 'Disable Automatic Repair Startup Enforcement',
          desc: 'Prevent Windows from prematurely looping into WinRE.',
          code: 'bcdedit /set {default} recoveryenabled No\nbcdedit /set {default} bootstatuspolicy ignoreallfailures'
        },
        {
          title: 'Restore Backup System Registry Hives (RegBack)',
          desc: 'If corrupted hives are found, swap corrupted hives with clean backups.',
          code: 'copy C:\\Windows\\System32\\config\\RegBack\\* C:\\Windows\\System32\\config\\'
        },
        {
          title: 'Disable Early Launch Anti-Malware Protection',
          desc: 'In WinRE Startup Settings (F8), choose Option 8: "Disable early-launch anti-malware protection" to bypass unsigned filter drivers.'
        }
      ],
      verification: 'Machine boots directly into Windows login without redirecting to the recovery environment.',
      proTip: 'If SrtTrail cites `bootsqm.dat` or `vsols.sys`, deleting the offending file directly from C:\\Windows\\System32\\drivers resolves the loop.'
    },

    {
      id: 'win-temp-profile',
      category: 'windows',
      severity: 'high',
      title: 'Windows Temp Profile: "You\'ve been signed in with a temporary profile"',
      errorCode: 'User Profile Service Event ID 1511 / 1515',
      summary: 'Windows cannot read the user NTUSER.DAT hive due to file locks or corruption, generating a temporary profile where files disappear upon sign-out.',
      tags: ['User Profile', 'Registry', 'Temp Profile', 'Permissions', 'NTUSER.DAT'],
      quickSnippet: 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList"',
      quickSnippetLang: 'cmd',
      rootCause: 'The user registry hive (C:\\Users\\<Username>\\NTUSER.DAT) is locked by antivirus or corrupted; Windows appends a .bak extension in the registry ProfileList.',
      symptoms: [
        'Desktop icons, browser logins, and desktop wallpaper reset to defaults',
        'Notification: "We can\'t sign into your account" or "You\'ve been signed in with a temporary profile"',
        'Any files saved to Desktop or Documents vanish on restart'
      ],
      steps: [
        {
          title: 'Sign in to a Secondary Local Administrator Account',
          desc: 'Never perform profile repairs while logged into the affected account or the temporary profile.'
        },
        {
          title: 'Navigate to ProfileList in Windows Registry',
          desc: 'Press Win+R -> type regedit -> Navigate to HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList.'
        },
        {
          title: 'Locate Corrupted SID and Remove .bak Extension',
          desc: 'Find the SID matching the affected user (look at ProfileImagePath). You will see two matching keys: one ending in .bak and one without.\n1. Rename the folder WITHOUT .bak by appending .old\n2. Rename the folder WITH .bak by removing the ".bak" suffix.\n3. Change "State" DWORD value to 0.\n4. Change "RefCount" DWORD value to 0.'
        },
        {
          title: 'Fix File Ownership and Permissions on User Folder',
          desc: 'Ensure the affected user account has Full Control over their user directory.',
          code: 'icacls "C:\\Users\\<Username>" /grant <Username>:(OI)(CI)F /T'
        }
      ],
      verification: 'Log out of admin, log back into the original user account; personal desktop, documents, and settings load without temporary profile warnings.',
      proTip: 'Check C:\\Users\\<Username> for a locked NTUSER.DAT.LOG file. A hanging antivirus scan or backup agent is almost always the initial culprit that triggered the lock.'
    },

    {
      id: 'win-update-0x80070002',
      category: 'windows',
      severity: 'medium',
      title: 'Windows Update Error 0x80070002 / 0x80240034 / 0x80070422',
      errorCode: '0x80070002 (ERROR_FILE_NOT_FOUND) / 0x80070422',
      summary: 'Windows Update engine fails to download, stage, or commit update packages due to corrupted SoftwareDistribution cache or stopped background services.',
      tags: ['Windows Update', 'WSUS', 'SoftwareDistribution', 'Bits', 'Catroot2'],
      quickSnippet: 'net stop wuauserv && net stop bits && ren C:\\Windows\\SoftwareDistribution SD.old && net start wuauserv',
      quickSnippetLang: 'cmd',
      rootCause: 'Corrupt payload in SoftwareDistribution download folder, damaged Catroot2 cryptographic catalog, or disabled BITS / TrustedInstaller service.',
      symptoms: [
        'Windows Update hangs at 0%, 20%, or 100% download',
        'Update fails with error codes: 0x80070002, 0x80070003, or 0x80240034',
        'DISM returns 0x800f081f "The source files could not be found"'
      ],
      steps: [
        {
          title: 'Stop Windows Update and BITS Services',
          desc: 'Halt all services interacting with update staging folders.',
          code: 'net stop wuauserv\nnet stop cryptSvc\nnet stop bits\nnet stop msiserver'
        },
        {
          title: 'Flush SoftwareDistribution and Catroot2 Repositories',
          desc: 'Rename the storage folders so Windows re-creates fresh caches.',
          code: 'ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old\nren C:\\Windows\\System32\\catroot2 catroot2.old'
        },
        {
          title: 'Restart Update Services and Trigger Background Check',
          desc: 'Bring services back online and trigger an immediate scan.',
          code: 'net start wuauserv\nnet start cryptSvc\nnet start bits\nnet start msiserver\n\nUsoClient StartScan'
        },
        {
          title: 'Reset Component Store via DISM Online RestoreHealth',
          desc: 'Repair payload manifests from Windows Update servers.',
          code: 'dism /online /cleanup-image /restorehealth'
        }
      ],
      verification: 'Windows Update settings page successfully downloads and installs updates without rollback; SoftwareDistribution folder is cleanly regenerated.',
      proTip: 'If domain joined, check if GPO "Specify intranet Microsoft update service location" is pointing to a dead WSUS server.'
    },

    {
      id: 'win-100-disk-usage',
      category: 'windows',
      severity: 'high',
      title: 'Windows 100% Disk Usage / StorAHCI.sys MSI Interrupt Bug',
      errorCode: 'StorAHCI.sys Event ID 129 / High Response Time',
      summary: 'Disk activity locks at 100% constantly while read/write throughput is minimal (under 500 KB/s), causing total system freezes and sluggish responsiveness.',
      tags: ['Performance', 'Disk 100%', 'StorAHCI', 'SysMain', 'MSI Bug'],
      quickSnippet: 'Stop-Service -Name SysMain -Force; Set-Service -Name SysMain -StartupType Disabled',
      quickSnippetLang: 'powershell',
      rootCause: 'StorAHCI.sys Message Signaled Interrupt (MSI) bug on SSDs/HDDs where AHCI driver resets controller after failed IO commands, or SysMain memory preloading thrashing.',
      symptoms: [
        'Task Manager shows 100% Disk Active Time, but Read/Write speed is near 0 MB/s',
        'Disk response time climbs into 2,000ms - 30,000ms',
        'System freezes for 20-40 seconds at a time'
      ],
      steps: [
        {
          title: 'Disable Message Signaled Interrupts (MSI) in Registry for StorAHCI',
          desc: 'Device Manager -> IDE ATA/ATAPI Controllers -> Standard SATA AHCI Controller -> Properties -> Details tab -> Device Instance Path.\nNavigate to: HKLM\\System\\CurrentControlSet\\Enum\\PCI\\<Device_Instance_Path>\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties\nChange MSISupported from 1 to 0.'
        },
        {
          title: 'Disable SysMain (Superfetch) Service',
          desc: 'SysMain often thrashes SSD storage trying to cache app launches.',
          code: 'powershell -Command "Stop-Service -Name SysMain -Force; Set-Service -Name SysMain -StartupType Disabled"'
        },
        {
          title: 'Disable Windows Search Indexing for Rotational / Troubled Drives',
          desc: 'Stop background search index thrashing.',
          code: 'powershell -Command "Stop-Service -Name WSearch -Force; Set-Service -Name WSearch -StartupType Disabled"'
        },
        {
          title: 'Verify Pagefile Configuration',
          desc: 'Set Pagefile size to System Managed or fixed at 1.5x physical RAM on the fastest NVMe drive.'
        }
      ],
      verification: 'Task Manager Disk Usage drops to normal baseline (0% - 10% idle); Event Viewer System log stops recording Event ID 129 "Reset to device, \\Device\\RaidPort0, was issued".',
      proTip: 'If MSI fix does not resolve it, run CrystalDiskInfo or smartctl to check for SSD NAND flash exhaustion and bad NAND blocks.'
    },

    {
      id: 'win-print-spooler-crash',
      category: 'windows',
      severity: 'medium',
      title: 'Print Spooler Service Crashing / Print Queue Stuck',
      errorCode: 'Service Control Manager Event ID 7031 / spoolsv.exe APPCRASH',
      summary: 'The Windows Print Spooler service crashes constantly or fails to print, holding phantom documents in queue that cannot be cancelled.',
      tags: ['Printer', 'Spooler', 'PrintNightmare', 'spoolsv.exe', 'Drivers'],
      quickSnippet: 'net stop spooler && del /Q /F /S "%systemroot%\\System32\\spool\\PRINTERS\\*.*" && net start spooler',
      quickSnippetLang: 'cmd',
      rootCause: 'Corrupted print spool file (.SHD / .SPL) stuck in PRINTERS spool folder, or incompatible Type 3 v3 kernel-mode printer driver crashing spoolsv.exe.',
      symptoms: [
        '"The local print spooler service is not running" error when printing',
        'Printers disappear from Devices and Printers menu',
        'Restarting Print Spooler service stops after 3-5 seconds'
      ],
      steps: [
        {
          title: 'Purge Stuck Spooler Jobs via Command Line',
          desc: 'Kill spooler and delete all binary job spool files.',
          code: 'net stop spooler\ndel /Q /F /S "%systemroot%\\System32\\spool\\PRINTERS\\*.*"\nnet start spooler'
        },
        {
          title: 'Remove Corrupted Printer Drivers via Print Management',
          desc: 'Press Win+R -> type printmanagement.msc -> Go to Custom Filters -> All Drivers. Right-click rogue third-party printer drivers -> Remove Driver Package.'
        },
        {
          title: 'Clean Spooler Registry Environments (Last Resort)',
          desc: 'Check registry key HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\\Environments\\Windows x64\\Print Processors. Only winprint should be default.'
        },
        {
          title: 'Migrate to Type 4 (v4) Class Drivers',
          desc: 'Replace legacy manufacturer Type 3 drivers with Microsoft IPP / v4 drivers to isolate memory from spoolsv.exe.'
        }
      ],
      verification: 'Print spooler service stays running in Services.msc with status "Running"; test page sends and completes immediately.',
      proTip: 'Never connect shared network printers using WSD (Web Services for Devices) ports. Always configure them using Standard TCP/IP Ports with raw 9100.'
    },

    /* =========================================================================
       CATEGORY 2: ACTIVE DIRECTORY & ENTERPRISE M365
       ========================================================================= */
    {
      id: 'ad-trust-relationship-failed',
      category: 'enterprise',
      severity: 'high',
      title: 'Domain Trust Failure: "The trust relationship between this workstation and the primary domain failed"',
      errorCode: 'Event ID 5722 / NETLOGON_AUTH_FAILED / Error 1786',
      summary: 'User cannot sign into domain workstation with their domain credentials because the computer password stored in AD does not match the local LSA secrets.',
      tags: ['Active Directory', 'Domain Trust', 'Netlogon', 'Kerberos', 'Reset-ComputerMachinePassword'],
      quickSnippet: 'Test-ComputerSecureChannel -Repair -Credential (Get-Credential)',
      quickSnippetLang: 'powershell',
      rootCause: 'Computer account password was rolled back by VM snapshot restoration, machine was offline > 30 days while machine password rotated, or computer account was disabled in AD.',
      symptoms: [
        'Login screen displays: "The trust relationship between this workstation and the primary domain failed"',
        'Cannot authenticate with any domain account; only local admin works',
        'Active Directory Users & Computers shows stale computer object'
      ],
      steps: [
        {
          title: 'Log in Using Local Administrator Account',
          desc: 'Sign in using `.\\Administrator` or local administrative credentials to access administrative PowerShell.'
        },
        {
          title: 'Repair Secure Channel Using PowerShell Test-ComputerSecureChannel',
          desc: 'Reset the computer password in AD without unjoining and rebooting.',
          code: 'Test-ComputerSecureChannel -Repair -Credential (Get-Credential)'
        },
        {
          title: 'Alternative CLI Repair via nltest',
          desc: 'Reset the secure channel password directly against a specific Domain Controller.',
          code: 'nltest /sc_reset:corp.contoso.com\\DC01.corp.contoso.com'
        },
        {
          title: 'Verify Computer Account is Enabled in Active Directory',
          desc: 'Confirm the computer object hasn\'t been disabled or moved to a "Disabled Computers" OU by an admin script.'
        }
      ],
      verification: '`Test-ComputerSecureChannel` outputs `True`; domain user logs in without trust failure error message.',
      proTip: 'Never revert a domain-joined virtual machine (VM) snapshot that is older than 30 days without first running `Reset-ComputerMachinePassword`.'
    },

    {
      id: 'ad-domain-join-failure',
      category: 'enterprise',
      severity: 'high',
      title: 'Active Directory Domain Join Failure: "Domain does not exist or cannot be contacted"',
      errorCode: 'Error 0x54B (1355) / ERROR_NO_SUCH_DOMAIN',
      summary: 'Client machine cannot join the enterprise Active Directory domain because it fails to locate a Domain Controller via DNS SRV record queries.',
      tags: ['Active Directory', 'DNS', 'Domain Join', 'SRV Records', 'DCLocator'],
      quickSnippet: 'nltest /dsgetdc:yourdomain.com /force',
      quickSnippetLang: 'cmd',
      rootCause: 'Client NIC is configured with public DNS (like 8.8.8.8) instead of internal Domain Controller DNS IP, or firewall is blocking RPC/NetBIOS/Kerberos ports.',
      symptoms: [
        'Attempting to join domain in System Properties fails with "An Active Directory Domain Controller for the domain could not be contacted"',
        'Netsetup.log shows: "NetpDoDomainJoin: status = 0x54b"',
        'Pinging domain.local times out or resolves to public external web server'
      ],
      steps: [
        {
          title: 'Verify Client DNS IP Configuration',
          desc: 'Confirm the client NIC primary DNS points ONLY to internal Active Directory DNS servers (Domain Controllers).',
          code: 'ipconfig /all\n\n# Correct it via PowerShell if set to DHCP/public:\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("192.168.1.10","192.168.1.11")'
        },
        {
          title: 'Test SRV Record Resolution via Nslookup',
          desc: 'Verify the client can resolve the DC locator SRV record (_ldap._tcp.dc._msdcs.<domain>).',
          code: 'nslookup -type=srv _ldap._tcp.dc._msdcs.corp.contoso.com'
        },
        {
          title: 'Test DC Locator Protocol via nltest',
          desc: 'Force discovery of the nearest Domain Controller.',
          code: 'nltest /dsgetdc:corp.contoso.com /force'
        },
        {
          title: 'Inspect Netsetup.log for Detailed Error Tracing',
          desc: 'Open the authoritative domain join log file located at C:\\Windows\\debug\\Netsetup.log.'
        }
      ],
      verification: 'Domain join dialog prompts for domain credentials and completes with "Welcome to the [Domain] domain" followed by prompt to restart.',
      proTip: 'Never set a public DNS (like 1.1.1.1 or 8.8.8.8) as secondary DNS on a domain workstation. Windows will query it concurrently, causing intermittent domain trust drops.'
    },

    {
      id: 'ad-gpo-not-applying',
      category: 'enterprise',
      severity: 'high',
      title: 'Group Policy Not Applying / GPO Replication Failure',
      errorCode: 'Event ID 1058 / Event ID 1085 / 0x80070003',
      summary: 'Workstations or users do not receive assigned Group Policy Objects, or gpupdate /force returns "The Group Policy Client-Side Extension failed".',
      tags: ['Group Policy', 'GPO', 'gpupdate', 'SYSVOL', 'WMI Filter'],
      quickSnippet: 'gpresult /h C:\\GPReport.html && start C:\\GPReport.html',
      quickSnippetLang: 'cmd',
      rootCause: 'SYSVOL DFSR replication is broken across Domain Controllers, WMI filter evaluates false, security filtering lacks "Authenticated Users" Read permissions, or time skew exceeds 5 minutes.',
      symptoms: [
        'Running gpupdate /force generates errors or does not apply mapped drives/printers',
        'Event Viewer GroupPolicy logs show Event ID 1058: "The processing of Group Policy failed"',
        'Different settings apply depending on which DC authenticates the user'
      ],
      steps: [
        {
          title: 'Generate HTML GPO Diagnostics Report',
          desc: 'Create an authoritative report of all winning, denied, and filtered GPOs.',
          code: 'gpresult /h C:\\GPO_Audit.html /f\nstart C:\\GPO_Audit.html'
        },
        {
          title: 'Check Kerberos Time Synchronization',
          desc: 'If client clock deviates > 5 minutes from Domain Controller PDC Emulator, Kerberos tickets fail and GPOs abort.',
          code: 'w32tm /query /status\nw32tm /resync /force'
        },
        {
          title: 'Verify "Authenticated Users" Read Permissions on GPO',
          desc: 'MS16-072 security update requires all Computer accounts (or Authenticated Users) to have "Read" permission on user GPOs in GPMC.'
        },
        {
          title: 'Purge Local GPO Cache on Client',
          desc: 'Delete cached registry policies to force complete redownload.',
          code: 'del /f /q "%ALLUSERSPROFILE%\\Microsoft\\Group Policy\\History\\*.*"\ngpupdate /force'
        }
      ],
      verification: 'gpupdate /force completes with "Computer policy update has completed successfully. User Policy update has completed successfully."',
      proTip: 'Check SYSVOL folder access from client by running: \\\\<Domain>\\SYSVOL. If you receive "Access Denied", SMB signing or DFS client provider is broken.'
    },

    {
      id: 'ad-account-lockout-storm',
      category: 'enterprise',
      severity: 'high',
      title: 'User Account Continually Locking Out / Kerberos Pre-Auth Failure',
      errorCode: 'Security Event ID 4740 (Lockout) / Event ID 4771 (Pre-auth fail)',
      summary: 'A user account is locked out repeatedly seconds after an administrator unlocks it in Active Directory, preventing work and generating massive DC logs.',
      tags: ['Active Directory', 'Security', 'Account Lockout', 'Kerberos', 'Credential Manager'],
      quickSnippet: 'Get-WinEvent -FilterHashtable @{LogName=\'Security\';Id=4740} -MaxEvents 5 | Format-List',
      quickSnippetLang: 'powershell',
      rootCause: 'Stale cached credentials in Windows Credential Manager, cached Outlook/Teams mobile sync, rogue mapped drive service, or scheduled task running under old password.',
      symptoms: [
        'User account locks out every 5-15 minutes automatically without user entering bad password',
        'DC Security Log repeatedly triggers Event ID 4740 with Caller Computer Name',
        'Radius/VPN server rejects user connection'
      ],
      steps: [
        {
          title: 'Query Domain Controller for Caller Computer Name',
          desc: 'Run PowerShell on the PDC Emulator to identify the exact device firing bad passwords.',
          code: 'Get-WinEvent -FilterHashtable @{LogName=\'Security\';Id=4740} -MaxEvents 10 | Select-Object TimeCreated, @{N=\'User\';E={$_.Properties[0].Value}}, @{N=\'SourceDevice\';E={$_.Properties[1].Value}} | Format-Table -AutoSize'
        },
        {
          title: 'Purge Windows Credential Manager on Offending Machine',
          desc: 'Open Credential Manager -> Windows Credentials -> Remove all generic/domain cached passwords for MicrosoftOffice, OneDrive, network shares.'
        },
        {
          title: 'Check Running Scheduled Tasks and Windows Services',
          desc: 'Identify tasks running under domain accounts with outdated credentials.',
          code: 'Get-ScheduledTask | Where-Object { $_.Principal.UserId -like "*<Username>*" }'
        },
        {
          title: 'Check Disconnected RDP / Virtual Sessions',
          desc: 'Run `qwinsta /server:<ServerName>` to find disconnected sessions holding lockouts.'
        }
      ],
      verification: 'Unlock the account in AD UC; monitoring Event ID 4740 on PDC shows zero subsequent lockout triggers over 1 hour.',
      proTip: 'Often an employee\'s mobile phone with corporate Exchange/Wi-Fi active is hitting the Exchange ActiveSync endpoint with an expired password after a password reset.'
    },

    {
      id: 'm365-aad-sync-errors',
      category: 'enterprise',
      severity: 'high',
      title: 'Microsoft Entra ID (Azure AD Connect) Sync Errors / Duplicate UPN',
      errorCode: 'Sync Error: AttributeValueMustBeUnique / InvalidSoftMatch',
      summary: 'On-premises Active Directory accounts fail to synchronize to Microsoft 365 / Entra ID, resulting in provisioning delays or duplicate cloud accounts.',
      tags: ['Azure AD', 'Entra ID', 'AAD Connect', 'Office 365', 'DirSync'],
      quickSnippet: 'Start-ADSyncSyncCycle -PolicyType Delta',
      quickSnippetLang: 'powershell',
      rootCause: 'Duplicate UserPrincipalName or ProxyAddresses (SMTP) already in use by an existing cloud user, or ImmutableId soft-match mismatch.',
      symptoms: [
        'Microsoft 365 Admin Center warning: "We detected synchronization errors"',
        'User created on-premise never appears in Microsoft 365 Exchange Online',
        'Email notification from Microsoft Entra Connect with "Duplicate attribute" alert'
      ],
      steps: [
        {
          title: 'Query Cloud Tenant for Colliding Attribute',
          desc: 'Use Microsoft Graph PowerShell to check which cloud object holds the duplicate SMTP/UPN.',
          code: 'Get-MgUser -Filter "UserPrincipalName eq \'user@company.com\' or Mail eq \'user@company.com\'" | Select-Object Id, DisplayName, UserPrincipalName'
        },
        {
          title: 'Resolve Soft-Match via Hard-Match ImmutableID Binding',
          desc: 'Convert on-premises objectGUID to Base64 and assign it as ImmutableId to the cloud user.',
          code: '$guid = (Get-ADUser -Identity "jdoe").objectGuid\n$immutableId = [System.Convert]::ToBase64String($guid.ToByteArray())\nSet-MgUser -UserId "jdoe@company.com" -OnPremisesImmutableId $immutableId'
        },
        {
          title: 'Trigger an Immediate Delta Synchronization Cycle',
          desc: 'Force Azure AD Connect server to push updates.',
          code: 'Start-ADSyncSyncCycle -PolicyType Delta'
        }
      ],
      verification: 'Run `Get-ADSyncScheduler` and verify Sync status is "Success"; M365 Admin Center sync error counter drops to 0.',
      proTip: 'Use IdFix (Office 365 IdFix tool) against local Active Directory to proactively catch illegal characters and duplicate proxyAddresses before running sync.'
    },

    /* =========================================================================
       CATEGORY 3: NETWORKING & CONNECTIVITY
       ========================================================================= */
    {
      id: 'net-apipa-169',
      category: 'network',
      severity: 'high',
      title: 'No Internet / APIPA IP Address (169.254.x.x Assigned)',
      errorCode: 'Automatic Private IP Addressing (APIPA) Active',
      summary: 'Workstation cannot obtain an IP address from the DHCP server and falls back to a non-routable 169.254.x.x address with "No Internet, Secured".',
      tags: ['DHCP', 'APIPA', 'IP Conflict', 'Network', 'Ethernet'],
      quickSnippet: 'ipconfig /release && ipconfig /renew',
      quickSnippetLang: 'cmd',
      rootCause: 'DHCP scope exhaustion, DHCP server service down, VLAN mismatch on switch port, DHCP Snooping blocking rogue responses, or local network adapter driver freeze.',
      symptoms: [
        'Network icon shows yellow triangle or globe with "No Internet Connection"',
        'ipconfig shows IPv4 Address: 169.254.xx.xx with Subnet 255.255.0.0',
        'Cannot ping local default gateway or access any local network resources'
      ],
      steps: [
        {
          title: 'Release and Request Fresh DHCP Lease',
          desc: 'Clear cached DHCP state and broadcast DORA discovery.',
          code: 'ipconfig /release\nipconfig /renew'
        },
        {
          title: 'Inspect Physical Layer & Switch Port VLAN',
          desc: 'Verify network cable link lights (Amber/Green). Check managed switch: ensure the port is assigned to the correct client Access VLAN, not an unrouted VLAN or trunk.'
        },
        {
          title: 'Check DHCP Server Scope Statistics',
          desc: 'Log into DHCP server (Windows Server DHCP or Core Router). Verify the scope has free addresses and has not hit 100% address pool exhaustion.'
        },
        {
          title: 'Restart DHCP Client Service and Reset TCP/IP Stack',
          desc: 'Flush Winsock and reset the IP stack to factory defaults.',
          code: 'netsh winsock reset\nnetsh int ip reset\nipconfig /flushdns'
        }
      ],
      verification: 'ipconfig displays a valid corporate IPv4 address (e.g. 10.x.x.x or 192.168.x.x) with correct Default Gateway; pings to internal DNS and 8.8.8.8 succeed.',
      proTip: 'If multiple PCs simultaneously get 169.254.x.x, check if DHCP Snooping was recently enabled on access switches without defining `ip dhcp snooping trust` on uplinks.'
    },

    {
      id: 'net-ip-conflict',
      category: 'network',
      severity: 'high',
      title: 'IP Address Conflict: "Another computer on this network has the same IP"',
      errorCode: 'Windows System Event ID 4199 (Tcpip) / Duplicate ARP Response',
      summary: 'Two host devices have been assigned the identical IPv4 address, triggering continuous packet collision and random connection dropouts for both devices.',
      tags: ['IP Conflict', 'ARP', 'DHCP', 'Networking', 'Duplicate IP'],
      quickSnippet: 'arp -a | findstr <conflict_ip>',
      quickSnippetLang: 'cmd',
      rootCause: 'A static IP was assigned inside an active DHCP scope pool without an exclusion/reservation, or a rogue device (printer, IoT, access point) came online.',
      symptoms: [
        'Windows toast popup: "Windows has detected an IP address conflict"',
        'Network connections drop and reconnect every 30-60 seconds',
        'Pinging the IP produces alternating MAC addresses in ARP table'
      ],
      steps: [
        {
          title: 'Identify Conflicting MAC Address via ARP Table',
          desc: 'Find the physical hardware MAC address claiming the IP.',
          code: 'arp -d <conflict_ip>\nping <conflict_ip>\narp -a | findstr <conflict_ip>'
        },
        {
          title: 'Trace MAC to Physical Switchport via Managed Switch CAM Table',
          desc: 'Locate the exact switch and port the rogue device is plugged into.',
          code: '# Cisco IOS:\nshow mac address-table address <Conflict_MAC_Address>'
        },
        {
          title: 'Create DHCP Reservation or Exclude Range',
          desc: 'In DHCP Manager, exclude the static IP range (e.g. .1 to .50) from the dynamic distribution pool.'
        },
        {
          title: 'Force Client to Request New Dynamic IP',
          desc: 'Release conflicted address and lease a fresh unallocated IP.',
          code: 'ipconfig /release\nipconfig /renew'
        }
      ],
      verification: 'Event Viewer System log stops recording Event ID 4199; continuous ping (`ping -t`) returns solid replies without latency spikes or dropped packets.',
      proTip: 'Enable "Conflict Detection Attempts" (set to 2) in Windows DHCP Server properties so the server pings an IP before offering it to a client.'
    },

    {
      id: 'net-dns-resolution-failure',
      category: 'network',
      severity: 'medium',
      title: 'DNS Resolution Failure / "DNS Server Not Responding"',
      errorCode: 'DNS_PROBE_FINISHED_NXDOMAIN / ERR_NAME_NOT_RESOLVED',
      summary: 'Websites and internal servers cannot be reached by hostname, though raw IP addresses (e.g., ping 8.8.8.8) respond successfully.',
      tags: ['DNS', 'Flush DNS', 'Hosts File', 'Nslookup', 'Networking'],
      quickSnippet: 'ipconfig /flushdns && netsh interface ip set dns "Ethernet" static 8.8.8.8',
      quickSnippetLang: 'cmd',
      rootCause: 'Corrupted local DNS resolver cache, faulty DNS forwarder on local router/DC, rogue entries in C:\\Windows\\System32\\drivers\\etc\\hosts, or port 53 UDP blockage.',
      symptoms: [
        'Web browsers show "DNS_PROBE_FINISHED_NXDOMAIN"',
        'Can ping 8.8.8.8, but pinging google.com says "could not find host"',
        'Internal intranet sites fail to resolve'
      ],
      steps: [
        {
          title: 'Flush and Register Local DNS Client Cache',
          desc: 'Purge poisoned or stale DNS cache from Windows memory.',
          code: 'ipconfig /flushdns\nipconfig /registerdns'
        },
        {
          title: 'Test Specific DNS Servers using Nslookup',
          desc: 'Test whether your configured DNS server responds vs a public resolver.',
          code: 'nslookup google.com\n\n# Query specific DNS server (e.g. Quad9):\nnslookup google.com 9.9.9.9'
        },
        {
          title: 'Check and Sanitize the Windows Hosts File',
          desc: 'Inspect for malware redirects or hardcoded overrides.',
          code: 'notepad C:\\Windows\\System32\\drivers\\etc\\hosts'
        },
        {
          title: 'Restart the Windows DNS Client Service',
          desc: 'Restart DNS client cache service via PowerShell.',
          code: 'Restart-Service -Name Dnscache -Force'
        }
      ],
      verification: '`nslookup domain.com` returns the authoritative IP address within 10ms; browser pages render immediately.',
      proTip: 'On modern Windows 11/10, DNS-over-HTTPS (DoH) can conflict with corporate firewalls conducting TLS inspection on port 443.'
    },

    {
      id: 'net-vpn-split-tunnel-leak',
      category: 'network',
      severity: 'high',
      title: 'Corporate VPN Handshake Drop / MTU Black Hole / Split-Tunneling Failure',
      errorCode: 'TLS Handshake Failed / MTU Fragmentation Drop',
      summary: 'Remote users connect to enterprise VPN (GlobalProtect / Cisco AnyConnect / WireGuard) but cannot access internal servers, or web traffic stalls completely.',
      tags: ['VPN', 'MTU', 'Routing', 'GlobalProtect', 'AnyConnect', 'Firewall'],
      quickSnippet: 'netsh interface ipv4 set subinterface "VPN" mtu=1350 store=persistent',
      quickSnippetLang: 'cmd',
      rootCause: 'Path MTU black hole (DF bit set with packet size > 1400 bytes causing silent drops), overlapping subnets between home router (192.168.1.0/24) and corporate LAN, or blocked UDP 500/4500 (IPsec).',
      symptoms: [
        'VPN connects with status "Connected", but internal websites load indefinitely',
        'Small pings (32 bytes) succeed, while large file transfers or web pages fail completely',
        'RDP sessions connect and immediately freeze on a black screen'
      ],
      steps: [
        {
          title: 'Detect Path MTU Fragmentation Boundary',
          desc: 'Ping internal host with Don\'t Fragment (DF) flag to find maximum transmittable packet size.',
          code: 'ping 10.0.0.1 -f -l 1472\nping 10.0.0.1 -f -l 1372\nping 10.0.0.1 -f -l 1320'
        },
        {
          title: 'Clamp MTU on the Virtual VPN Network Adapter',
          desc: 'Lower adapter MTU to 1350 to prevent upstream router packet fragmentation drops.',
          code: 'netsh interface ipv4 show subinterfaces\nnetsh interface ipv4 set subinterface "<VPN_Adapter_Name>" mtu=1350 store=persistent'
        },
        {
          title: 'Check for Subnet Collision (IP Conflict)',
          desc: 'Check if user\'s home subnet (e.g. 192.168.1.0/24) duplicates corporate target network.',
          code: 'route print | findstr 192.168.1.'
        },
        {
          title: 'Flush Routing Table',
          desc: 'Clear stale routes created by previous VPN tunnels.',
          code: 'route -f'
        }
      ],
      verification: 'Internal intranet portal loads instantly over VPN; pinging with packet size 1300 returns replies without packet loss.',
      proTip: 'When RDP disconnects immediately after showing the desktop over VPN, 99% of the time it is MTU size dropping large initial TLS bitmap packets.'
    },

    /* =========================================================================
       CATEGORY 4: LINUX & SYSADMIN
       ========================================================================= */
    {
      id: 'linux-systemd-failed',
      category: 'linux',
      severity: 'high',
      title: 'Systemd Service Crashloop: "Unit entered failed state" / Exit Code 1/FAILURE',
      errorCode: 'systemd status: failed (Result: exit-code)',
      summary: 'A critical Linux service (nginx, apache2, docker, mysqld) fails to start or continuously restarts with exit code 1 or 203/EXEC.',
      tags: ['Linux', 'systemd', 'journalctl', 'Crashloop', 'SysAdmin'],
      quickSnippet: 'journalctl -xeu <service_name>.service --no-pager',
      quickSnippetLang: 'bash',
      rootCause: 'Configuration syntax error, permission denied on log/PID files, port conflict (address already in use), or missing dependency binary specified in ExecStart.',
      symptoms: [
        'systemctl start <service> outputs: "Job for <service> failed because the control process exited with error code"',
        'systemctl status displays: Active: failed (Result: exit-code)',
        'Endpoints running on that daemon return Connection Refused'
      ],
      steps: [
        {
          title: 'Inspect Live Service Journal Logs',
          desc: 'Query systemd journal to pinpoint the exact line triggering the crash.',
          code: 'journalctl -xeu <service_name>.service --no-pager -n 50'
        },
        {
          title: 'Check for TCP Port Binding Conflicts',
          desc: 'Determine if another process is already occupying the listening port.',
          code: 'sudo ss -tulpn | grep :<port_number>\n\n# Or using lsof:\nsudo lsof -i :<port_number>'
        },
        {
          title: 'Validate Service Configuration File Syntax',
          desc: 'Test configuration files before launching systemd.',
          code: '# For Nginx:\nsudo nginx -t\n\n# For Apache:\nsudo apachectl configtest\n\n# For Docker daemon:\nsudo dockerd --validate'
        },
        {
          title: 'Fix File Ownership on Working Directories',
          desc: 'Ensure the run user has write access to logs and runtime sockets.',
          code: 'sudo chown -R <service_user>:<service_group> /var/log/<service> /var/lib/<service>'
        },
        {
          title: 'Reload Systemd Daemon and Restart Unit',
          desc: 'Notify systemd of unit file modifications.',
          code: 'sudo systemctl daemon-reload\nsudo systemctl restart <service_name>'
        }
      ],
      verification: '`systemctl status <service>` displays "Active: active (running)" with a valid main PID.',
      proTip: 'Exit code 203/EXEC means the binary path in ExecStart does not exist, lacks execute permissions (`chmod +x`), or points to a non-existent interpreter.'
    },

    {
      id: 'linux-inode-exhaustion',
      category: 'linux',
      severity: 'high',
      title: 'Linux "No space left on device" with Free Disk Space (Inode Exhaustion)',
      errorCode: 'Errno 28: No space left on device (df -h shows free space)',
      summary: 'Applications crash stating disk is full, but `df -h` shows gigabytes of available storage. Caused by 100% Inode exhaustion.',
      tags: ['Linux', 'Storage', 'Inodes', 'df', 'SysAdmin'],
      quickSnippet: 'df -i && find / -xdev -printf \'%h\\n\' | sort | uniq -c | sort -k 1 -n | tail -15',
      quickSnippetLang: 'bash',
      rootCause: 'Millions of zero-byte or tiny files (session caches, PHP sessions, Docker build layers, mail queues) consuming every available file index pointer (inode).',
      symptoms: [
        'Attempting to create a file via `touch test.txt` returns `No space left on device`',
        '`df -h` reports 40% or more available disk capacity',
        '`df -i` shows Inode usage (IUse%) at 100%'
      ],
      steps: [
        {
          title: 'Verify Inode Allocation Status',
          desc: 'Check inode percentage across all mounted filesystems.',
          code: 'df -i'
        },
        {
          title: 'Locate Directories Containing Millions of Micro-Files',
          desc: 'Scan filesystems to aggregate file count per directory hierarchy.',
          code: 'find /var -xdev -printf \'%h\\n\' | sort | uniq -c | sort -k 1 -n | tail -20'
        },
        {
          title: 'Safely Purge Million-File Directories Without Shell Argument Limit',
          desc: 'Avoid using `rm -rf *` which fails with "Argument list too long". Use `find -delete`.',
          code: '# Purge old session or spool files:\nfind /var/spool/clientmqueue -type f -delete\nfind /tmp -type f -mtime +7 -delete'
        },
        {
          title: 'Inspect Docker Overlay Storage and Dangling Images',
          desc: 'Docker build layers create massive inode footprints.',
          code: 'docker system prune -a --volumes -f'
        }
      ],
      verification: '`df -i` shows `IUse%` drop below 60%; `touch /tmp/testfile` completes without error.',
      proTip: 'Inodes are fixed at filesystem creation time on ext4. If you have an application creating billions of microfiles, format storage with XFS or specify `-N` on `mkfs.ext4`.'
    },

    {
      id: 'linux-read-only-fs',
      category: 'linux',
      severity: 'critical',
      title: 'Linux Read-Only Filesystem Remount / Filesystem Corruption',
      errorCode: 'Read-only file system / kernel: [EXT4-fs error] Remounting filesystem read-only',
      summary: 'The Linux kernel detects underlying disk blocks corruption or I/O timeouts, automatically remounting root or data partitions in read-only mode to prevent data loss.',
      tags: ['Linux', 'Storage', 'fsck', 'Ext4', 'Kernel'],
      quickSnippet: 'sudo touch /forcefsck && sudo reboot',
      quickSnippetLang: 'bash',
      rootCause: 'Underlying SAN/LUN disconnect, uncorrectable bad blocks on SSD, or improper sudden power loss corrupting ext4 journal.',
      symptoms: [
        'Writing any file outputs: "touch: cannot touch \'file\': Read-only file system"',
        'dmesg outputs: "EXT4-fs error (device sda1): ext4_lookup: deleted inode referenced"',
        'Services dependent on logging (/var/log) crash'
      ],
      steps: [
        {
          title: 'Check dmesg for Specific Device Block Errors',
          desc: 'Identify which block device tripped the read-only remount.',
          code: 'dmesg -T | grep -i "read-only\\|error\\|ext4\\|xfs"'
        },
        {
          title: 'Attempt Clean Live Remount (If Temporary SAN Dropout)',
          desc: 'If backend SAN connectivity is restored, attempt to remount read-write.',
          code: 'sudo mount -o remount,rw /'
        },
        {
          title: 'Force Offline fsck on Next System Reboot',
          desc: 'Schedule non-destructive automatic filesystem consistency check.',
          code: 'sudo touch /forcefsck\nsudo reboot'
        },
        {
          title: 'Run Manual fsck from Rescue Media (If Boot Fails)',
          desc: 'Unmount target partition and execute interactive repair.',
          code: 'sudo umount /dev/sdb1\nsudo fsck -y /dev/sdb1'
        }
      ],
      verification: '`mount | grep " / "` displays `(rw,relatime...)`; test write via `touch /tmp/rw_test && rm /tmp/rw_test` succeeds.',
      proTip: 'Never run `fsck` on an active, read-write mounted partition. It can result in catastrophic metadata destruction.'
    },

    {
      id: 'linux-ssh-permission-denied',
      category: 'linux',
      severity: 'medium',
      title: 'SSH "Permission denied (publickey,gssapi-keyex,gssapi-with-mic)"',
      errorCode: 'SSH exit code 255 / Permission Denied (publickey)',
      summary: 'SSH connection to remote Linux server is rejected even though the private key exists locally and matches the public key.',
      tags: ['Linux', 'SSH', 'Security', 'Permissions', 'Keys'],
      quickSnippet: 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys',
      quickSnippetLang: 'bash',
      rootCause: 'StrictModes check failed in sshd because ~/.ssh directory or ~/.ssh/authorized_keys permissions are too permissive (group-writable), or SELinux context is invalid.',
      symptoms: [
        'Running `ssh user@server` returns "Permission denied (publickey)"',
        '`ssh -vvv` output shows server offering publickey but client key rejected',
        '/var/log/auth.log or secure shows "Authentication refused: bad ownership or modes"'
      ],
      steps: [
        {
          title: 'Verify Local Key Permissions',
          desc: 'Local private keys must be readable only by the owner.',
          code: 'chmod 600 ~/.ssh/id_rsa\nchmod 600 ~/.ssh/id_ed25519'
        },
        {
          title: 'Fix Remote SSH Directory and Authorized Keys Permissions',
          desc: 'Apply strict Unix permissions required by SSH daemon StrictModes.',
          code: 'chmod 700 ~/.ssh\nchmod 600 ~/.ssh/authorized_keys\nchown -R $USER:$USER ~/.ssh'
        },
        {
          title: 'Restore SELinux Security Context on SSH Keys',
          desc: 'On RHEL/CentOS/AlmaLinux, missing ssh_home_t contexts block key reads silently.',
          code: 'restorecon -R -v ~/.ssh'
        },
        {
          title: 'Run SSH with Full Verbose Debugging',
          desc: 'Examine exact negotiation and accepted algorithms.',
          code: 'ssh -vvv -i ~/.ssh/id_ed25519 user@remote_server'
        }
      ],
      verification: 'SSH connection logs into remote shell immediately without requesting fallback password.',
      proTip: 'Modern OpenSSH 8.8+ disables ssh-rsa (SHA-1) by default. If connecting to older legacy appliances, upgrade the key to ed25519 or pass `-o HostKeyAlgorithms=+ssh-rsa`.'
    },

    /* =========================================================================
       CATEGORY 5: HARDWARE & DIAGNOSTICS
       ========================================================================= */
    {
      id: 'hw-post-beep-matrix',
      category: 'hardware',
      severity: 'critical',
      title: 'POST Beep Codes & Motherboard Diagnostic LED Decoder',
      errorCode: 'No POST / Beep Sequences / Q-LED Codes',
      summary: 'Computer powers on with fans spinning but displays black screen; motherboard emits specific beep patterns or illuminates debug LEDs.',
      tags: ['Hardware', 'POST', 'Beep Codes', 'RAM', 'Motherboard'],
      quickSnippet: 'Check Motherboard Q-LED: CPU (Red), DRAM (Yellow), VGA (White), BOOT (Green)',
      quickSnippetLang: 'text',
      rootCause: 'RAM unseated/defective, GPU missing PCIe auxiliary power, CPU socket bent pins, dead CMOS coin cell battery (CR2032), or short-circuit to chassis.',
      symptoms: [
        'Monitor shows "No Signal"',
        'Motherboard speaker emits pattern of beeps (e.g. 1 long, 2 short)',
        'Diagnostic Q-LEDs hang on DRAM (Amber/Orange) or CPU (Red)'
      ],
      steps: [
        {
          title: 'Identify Beep Code Meaning by BIOS Vendor',
          desc: 'Reference the universal POST failure matrix:\n• AMI BIOS: 1 Beep = DRAM Refresh failure; 3 Beeps = Base 64K RAM failure; 5 Beeps = Processor failure; 8 Beeps = Display Memory Read/Write error.\n• Dell: 2 Beeps = No RAM detected; 3 Beeps = Motherboard failure; 4 Beeps = Memory read/write failure.\n• HP: 3 Long, 2 Short = Memory initialization error; 3 Long, 3 Short = Graphics controller not found.'
        },
        {
          title: 'Reseat and Single-Stick Test RAM Modules',
          desc: 'Power off -> Unplug PSU -> Remove all RAM sticks. Insert ONLY ONE stick into primary slot (usually Slot A2 / Slot 2) and boot. Repeat with each stick.'
        },
        {
          title: 'Clear Motherboard CMOS (Hardware Reset)',
          desc: 'Remove CR2032 battery for 5 minutes and bridge CLR_CMOS jumper pins with a screwdriver for 10 seconds to restore factory BIOS defaults.'
        },
        {
          title: 'Perform Minimal Breadboard Bench Test',
          desc: 'Disconnect all USB headers, front panel audio, SATA drives, and PCIe add-on cards. Power on with only CPU, 1 stick of RAM, and PSU.'
        }
      ],
      verification: 'Diagnostic Q-LED turns Green (BOOT); motherboard emits single short POST beep and display shows BIOS splash screen.',
      proTip: 'When modern motherboards sit for 2-3 minutes on DRAM amber LED during first boot with DDR5, this is normal "Memory Training", NOT a hardware crash. Do not interrupt it!'
    },

    {
      id: 'hw-thermal-throttling',
      category: 'hardware',
      severity: 'high',
      title: 'CPU / GPU Overheating & Thermal Throttling / Sudden Power Off',
      errorCode: 'PROCHOT# Active / Event ID 37 (Kernel-Processor-Power)',
      summary: 'Computer stutters drastically under load or abruptly cuts power without blue screening due to hardware thermal safety triggers.',
      tags: ['Hardware', 'Thermals', 'Overheating', 'Cooler', 'Throttling'],
      quickSnippet: 'powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c (High Performance)',
      quickSnippetLang: 'cmd',
      rootCause: 'Dried thermal paste, failed AIO liquid cooler pump (0 RPM), dust-clogged heatsink fins, or mounting bracket uneven pressure.',
      symptoms: [
        'CPU temperature reaches 95°C - 100°C within 15 seconds of starting a task',
        'Clock speeds drop from 4.5 GHz down to 800 MHz (PROCHOT limit)',
        'PC powers off abruptly after 10-20 minutes of gaming or rendering'
      ],
      steps: [
        {
          title: 'Monitor Live Temperatures and Clocks via HWiNFO64',
          desc: 'Check Core Temperatures, Package Power, and "Thermal Throttling" flags.'
        },
        {
          title: 'Inspect AIO Liquid Cooler Pump RPM',
          desc: 'In BIOS or hardware monitor, verify AIO_PUMP header reads between 2,000 - 4,000 RPM. If reading 0 RPM, pump impeller has died.'
        },
        {
          title: 'Repaste Heatsink with High-Quality Thermal Compound',
          desc: 'Clean off dried paste using 99% Isopropyl Alcohol. Apply pea-sized dot of Arctic MX-6 / Noctua NT-H2 and re-torque screws in cross-diagonal X pattern.'
        },
        {
          title: 'Verify Peel-Off Plastic Protector Was Removed',
          desc: 'A frequent technician oversight: check if the transparent warning sticker under the cooler heatsink cold plate was left on during installation!'
        }
      ],
      verification: 'CPU idle temperatures sit between 35°C - 45°C; 100% stress test (Cinebench) tops out below 85°C with no clock throttling.',
      proTip: 'If one AIO tube is scalding hot and the other is freezing cold, liquid circulation is completely blocked or air-locked.'
    },

    {
      id: 'hw-nvme-smart-failure',
      category: 'hardware',
      severity: 'critical',
      title: 'Storage Drive Failure / SMART Predictive Alerts (Bad Sectors & SSD Wear)',
      errorCode: 'SMART Attribute 05 / C5 / Available Spare Below Threshold',
      summary: 'System freezes during file operations, BIOS warns "SMART Status BAD, Backup and Replace", or CrystalDiskInfo marks drive Caution/Bad.',
      tags: ['Hardware', 'SSD', 'NVMe', 'SMART', 'Data Recovery'],
      quickSnippet: 'wmic diskdrive get status,model,name',
      quickSnippetLang: 'cmd',
      rootCause: 'Flash NAND cell degradation on SSD, head crash or magnetic surface degradation on HDD resulting in reallocated and pending uncorrectable sectors.',
      symptoms: [
        'Boot time increases from seconds to several minutes',
        'Windows Event Viewer shows disk Event ID 7: "The device, \\Device\\Harddisk0\\DR0, has a bad block"',
        'Files become unreadable or throw I/O Device Error (0x8007045D)'
      ],
      steps: [
        {
          title: 'Check Basic SMART Status from Windows CLI',
          desc: 'Execute immediate WMI disk query.',
          code: 'wmic diskdrive get status,model,name'
        },
        {
          title: 'Analyze Critical SMART Attributes',
          desc: 'Evaluate key health indicators:\n• Attribute 05 (Reallocated Sectors Count): Must be ZERO. Raw value > 0 means physical sector remapping has begun.\n• Attribute C5 (Current Pending Sector Count): Unstable sectors waiting to be remapped.\n• Attribute E7 / Available Spare (NVMe): Percentage of reserve NAND blocks remaining.'
        },
        {
          title: 'IMMEDIATELY Freeze Write Operations & Image the Drive',
          desc: 'Do NOT run chkdsk /r on a physically dying drive! It will destroy failing sectors. Use ddrescue or raw cloning.',
          code: '# Linux ddrescue raw sector image copy to good target drive:\nsudo ddrescue -d -r3 /dev/sdb /dev/sdc /home/user/rescue.log'
        },
        {
          title: 'Replace Hardware & Restore Backup',
          desc: 'Swap physical drive and restore image onto new NVMe/SATA SSD.'
        }
      ],
      verification: 'New storage drive reports SMART Status "OK / Good 100%" with 0 reallocated sectors; I/O error logs cease.',
      proTip: 'Running `chkdsk /f /r` on an SSD or HDD with failing mechanical heads forces immense stress on degraded sectors and can completely kill the drive before data is recovered.'
    },

    /* =========================================================================
       CATEGORY 6: CYBERSECURITY & INCIDENT RESPONSE
       ========================================================================= */
    {
      id: 'sec-ransomware-first-response',
      category: 'security',
      severity: 'critical',
      title: 'Ransomware Emergency First Response: Containment & Quarantine Protocol',
      errorCode: 'INCIDENT RESPONSE: P1 ACTIVE RANSOMWARE OUTAGE',
      summary: 'Host or server shows encrypted files (.locked, .crying, etc.) and ransom note popups. Immediate containment protocol must be executed within 60 seconds.',
      tags: ['Ransomware', 'Incident Response', 'Security', 'Malware', 'Containment'],
      quickSnippet: 'Disconnect physical Ethernet immediately; DO NOT power off RAM volatile memory!',
      quickSnippetLang: 'text',
      rootCause: 'Active intrusion executing unauthorized symmetric/asymmetric encryption of local files and network SMB shares.',
      symptoms: [
        'File extensions changed across desktop and file shares (e.g., .lockbit, .blackcat)',
        'README_RESTORE_FILES.txt or HTML notes appearing on desktop',
        'Massive outbound traffic spikes and CPU running at 100% on unfamiliar processes'
      ],
      steps: [
        {
          title: 'ISOLATE NETWORK INTERFACES IMMEDIATELY (Do Not Power Off!)',
          desc: 'Unplug the physical Ethernet cable and disable Wi-Fi. DO NOT REBOOT OR POWER OFF THE MACHINE! Rebooting destroys volatile RAM containing encryption keys, attacker C2 artifacts, and memory injection payloads.'
        },
        {
          title: 'Isolate Shared Enterprise SMB Shares',
          desc: 'From a clean administrative terminal, immediately halt SMB Server service on core network NAS/File Servers to stop lateral traversal.',
          code: '# On Windows File Servers:\nStop-Service -Name LanmanServer -Force'
        },
        {
          title: 'Capture Volatile Memory Dump (Forensics)',
          desc: 'Insert a clean write-blocked USB drive and capture full memory via dumpit or WinPmem.',
          code: 'winpmem.exe -o C:\\incident_memory.raw'
        },
        {
          title: 'Triage Running Processes & Establish Containment',
          desc: 'Dump active network sockets and kill parent processes matching unknown execution hashes.',
          code: 'netstat -ano | findstr ESTABLISHED\nGet-Process | Where-Object { $_.Path -notlike "C:\\Windows\\*" } | Format-Table Id, Name, Path'
        },
        {
          title: 'Revoke Compromised Domain Credentials & Invalidate Kerberos KRBTGT',
          desc: 'Reset all Domain Admin passwords and perform double-rotation of KRBTGT account password to invalidate golden tickets.'
        }
      ],
      verification: 'Network monitoring confirms no outbound beaconing to malicious C2 IP addresses; lateral encryption has ceased across all file servers.',
      proTip: 'Keep Volume Shadow Copies (VSS) preserved if possible. Some ransomware strains fail to purge VSS if executed without full NT AUTHORITY\\SYSTEM privileges.'
    },

    {
      id: 'sec-phishing-header-analysis',
      category: 'security',
      severity: 'medium',
      title: 'Phishing Email Header Forensics & SPF / DKIM / DMARC Failures',
      errorCode: 'DMARC: FAIL / SPF: SoftFail / Spoofed Sender Identity',
      summary: 'Investigating high-risk phishing emails impersonating executives or vendors to verify spoofing and trace malicious relay IP addresses.',
      tags: ['Email', 'Phishing', 'SPF', 'DKIM', 'DMARC', 'Security'],
      quickSnippet: 'Authentication-Results: spf=fail dmarc=fail action=quarantine',
      quickSnippetLang: 'text',
      rootCause: 'Lack of strict DMARC enforcement (p=none) allowing attackers to spoof From: headers, or compromised third-party mail relay.',
      symptoms: [
        'Email appears from "CEO <ceo@company.com>" but originates from an external server',
        'Links redirect to look-alike credential harvesting domains',
        'Urgent demands for wire transfers, gift cards, or MFA token confirmations'
      ],
      steps: [
        {
          title: 'Extract Complete RFC 822 Internet Headers',
          desc: 'In Outlook: File -> Properties -> Internet headers. In Webmail: View Message Details -> Original Source.'
        },
        {
          title: 'Inspect Authentication-Results Header',
          desc: 'Evaluate the three critical email authentication mechanisms:\n• SPF (Sender Policy Framework): Confirms if transmitting IP is authorized in DNS TXT.\n• DKIM (DomainKeys Identified Mail): Cryptographic signature verifying body wasn\'t modified.\n• DMARC: Policy action if SPF/DKIM fail (none, quarantine, reject).'
        },
        {
          title: 'Trace Original Originating IP Address',
          desc: 'Inspect the bottom-most `Received: from` header to identify the true initial IP address of the transmitting client rather than relay servers.',
          code: 'Received: from mail.attacker.com (198.51.100.25) by mail.contoso.com'
        },
        {
          title: 'Block Malicious Sender IP & Domain Across Tenant',
          desc: 'Add sender IP and domain to Microsoft Defender / Exchange Online Protection tenant block list.'
        }
      ],
      verification: 'Exchange message trace confirms subsequent spoofed emails from attacker infrastructure are dropped with 550 5.7.1 DMARC rejection.',
      proTip: 'Pay close attention to the `Return-Path` vs `From:` address. Phishing attacks frequently mismatch these two headers to bypass naive user inspection.'
    },

    /* =========================================================================
       CATEGORY 7: MASTER COMMAND VAULT
       ========================================================================= */
    {
      id: 'cmd-network-stack-reset',
      category: 'commands',
      severity: 'medium',
      title: 'The Nuclear Windows Network Stack Reset (Batch Script)',
      errorCode: 'Network Reset Pipeline',
      summary: 'Complete multi-step reset of Winsock, TCP/IP v4 & v6, ARP tables, DNS cache, and DHCP leases to clear persistent connectivity corruption.',
      tags: ['Network', 'Reset', 'Winsock', 'TCP/IP', 'Script'],
      quickSnippet: 'netsh winsock reset && netsh int ip reset && ipconfig /flushdns',
      quickSnippetLang: 'cmd',
      rootCause: 'Corrupted Winsock catalog LSPs, poisoned ARP entries, or misconfigured static network bindings.',
      symptoms: [
        'Browser fails to load pages despite valid IP configuration',
        'VPN clients refuse to route packets after abnormal disconnect',
        'Software firewall hooks interfering with network traffic'
      ],
      steps: [
        {
          title: 'Execute Master Batch Reset Script (As Administrator)',
          desc: 'Run each reset command sequentially in an elevated command prompt.',
          code: 'ipconfig /flushdns\nipconfig /registerdns\nipconfig /release\nipconfig /renew\nnetsh winsock reset\nnetsh int ip reset\nnetsh interface ipv4 reset\nnetsh interface ipv6 reset\narp -d *\nnbtstat -R\nnbtstat -RR'
        },
        {
          title: 'Reboot Computer to Finalize Winsock Initialization',
          desc: 'Reboot is mandatory for the operating system to rebuild catalog socket providers.',
          code: 'shutdown /r /t 0'
        }
      ],
      verification: 'System boots up, acquires clean DHCP lease, and pings default gateway with 0% packet loss.',
      proTip: 'Save these lines into `netreset.bat` on an admin USB key for rapid deployment across field troubleshooting calls.'
    },

    {
      id: 'cmd-powershell-hardware-audit',
      category: 'commands',
      severity: 'low',
      title: 'PowerShell Rapid Hardware & Serial Number Audit One-Liner',
      errorCode: 'System Specification Extraction',
      summary: 'Extract BIOS serial number, motherboard model, CPU details, RAM configuration, and GPU specs in one consolidated table.',
      tags: ['PowerShell', 'Audit', 'Hardware', 'Serial Number', 'Specs'],
      quickSnippet: 'Get-CimInstance Win32_BIOS | Select-Object SerialNumber, Manufacturer, SMBIOSBIOSVersion',
      quickSnippetLang: 'powershell',
      rootCause: 'Need for rapid machine inventory without opening chassis or rebooting to BIOS.',
      symptoms: ['Helpdesk onboarding', 'Warranty check', 'Hardware inventory tracking'],
      steps: [
        {
          title: 'Query Computer System, BIOS, and Serial Number',
          desc: 'Retrieve hardware identity from CIM repository.',
          code: 'Get-CimInstance Win32_ComputerSystem | Select-Object Model, Manufacturer, TotalPhysicalMemory;\nGet-CimInstance Win32_BIOS | Select-Object SerialNumber, SMBIOSBIOSVersion'
        },
        {
          title: 'Query RAM Speeds and Slot Utilization',
          desc: 'Check populated memory banks, capacities, and frequencies.',
          code: 'Get-CimInstance Win32_PhysicalMemory | Select-Object DeviceLocator, Capacity, Speed, Manufacturer, PartNumber | Format-Table -AutoSize'
        },
        {
          title: 'Generate Windows Battery Health Report',
          desc: 'Create an official battery degradation diagnostic report on laptops.',
          code: 'powercfg /batteryreport /output "C:\\BatteryReport.html"\nstart C:\\BatteryReport.html'
        }
      ],
      verification: 'Output outputs clean tabular hardware specifications within 2 seconds.',
      proTip: 'WMIC is deprecated in modern Windows 11 builds; always standardize your automation scripts on `Get-CimInstance` instead of `Get-WmiObject` or `wmic`.'
    },

    {
      id: 'cmd-robocopy-mirror',
      category: 'commands',
      severity: 'medium',
      title: 'Robocopy Enterprise Mirror & Backup Script (With ACLs and Multi-Threading)',
      errorCode: 'Data Migration Pipeline',
      summary: 'High-speed multi-threaded Robocopy command to migrate terabytes of user data, retaining NTFS permissions, timestamps, and skipping locked files.',
      tags: ['Robocopy', 'Migration', 'Backup', 'NTFS', 'Script'],
      quickSnippet: 'robocopy "D:\\Source" "E:\\Dest" /MIR /COPYALL /ZB /R:1 /W:1 /MT:16 /V /NP /LOG:"C:\\migration.log"',
      quickSnippetLang: 'cmd',
      rootCause: 'Standard Windows Explorer copy hangs on permissions, long file paths (>260 chars), or open files.',
      symptoms: ['File server migration', 'User profile backup', 'Data replication'],
      steps: [
        {
          title: 'Production Robocopy Syntax Breakdown',
          desc: 'The gold-standard parameter combination for enterprise data transfers:\n• `/MIR` : Mirrors directory tree (purges files in dest that no longer exist in source).\n• `/COPYALL` : Copies Data, Attributes, Timestamps, NTFS ACLs, Owner info, Auditing.\n• `/ZB` : Uses Restartable mode; falls back to Backup Operator mode to bypass file locks.\n• `/R:1 /W:1` : Retry 1 time, wait 1 second (avoids 1,000,000 second default hang on locked files).\n• `/MT:16` : Uses 16 parallel worker threads for 8x speed increase.\n• `/NP /LOG` : Suppresses per-percentage progress and writes output to log file.'
        },
        {
          title: 'Execute One-Line Migration Command',
          desc: 'Run elevated in Command Prompt.',
          code: 'robocopy "D:\\SourceData" "\\\\FileServer\\Backup$" /MIR /COPYALL /ZB /R:1 /W:1 /MT:16 /V /NP /LOG:"C:\\Migration_Log.txt"'
        }
      ],
      verification: 'Robocopy log prints summary footer showing 0 Failed files and matching byte counts.',
      proTip: 'Always run first with `/L` (List only) switch to perform a dry run test before executing a live `/MIR`!'
    },

    {
      id: 'cmd-cisco-switch-troubleshooting',
      category: 'commands',
      severity: 'medium',
      title: 'Cisco IOS Switchport & VLAN Diagnostic Cheat Sheet',
      errorCode: 'Cisco Switch Troubleshooting',
      summary: 'Production CLI commands for checking port status, duplex mismatches, CRC errors, and VLAN assignments on enterprise network switches.',
      tags: ['Cisco', 'Switch', 'VLAN', 'Networking', 'CLI'],
      quickSnippet: 'show interface status | include connected',
      quickSnippetLang: 'text',
      rootCause: 'Port down/err-disable, speed/duplex mismatch, or missing VLAN on trunk link.',
      symptoms: [
        'Device link light is unlit or amber',
        'Extreme packet loss and sluggish file transfers over LAN',
        'Port drops into err-disabled state after plugging in new device'
      ],
      steps: [
        {
          title: 'Check Port Link State and VLAN Mapping',
          desc: 'Verify if the port is connected and assigned to the proper Access VLAN.',
          code: 'enable\nshow interface status\nshow interface status | include Gi1/0/12'
        },
        {
          title: 'Inspect Duplex Mismatches and CRC Error Counters',
          desc: 'High CRC errors indicate damaged Cat6 cable, bad crimp, or speed/duplex collision.',
          code: 'show interface Gi1/0/12 | include CRC|duplex|errors'
        },
        {
          title: 'Recover Port from Err-Disabled State (Port Security / BPDU Guard)',
          desc: 'Bounce the port after fixing the offending cable or unauthorized MAC address.',
          code: 'configure terminal\ninterface Gi1/0/12\nshutdown\nno shutdown\nexit'
        },
        {
          title: 'Trace Connected Neighbor via CDP / LLDP',
          desc: 'Discover connected phone, access point, or neighboring switch.',
          code: 'show cdp neighbors Gi1/0/12 detail'
        }
      ],
      verification: 'Port changes state to `up/up`; CRC input error counter stops incrementing.',
      proTip: 'If a port continually falls into err-disable, run `show log` or `show errdisable recovery` to identify if BPDU Guard or Port Security was tripped.'
    }
  ]
};

// Export to window
window.IT_DATABASE = IT_DATABASE;
