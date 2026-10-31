/**
 * TITAN IT - THE ULTIMATE ENTERPRISE IT & TROUBLESHOOTING ENCYCLOPEDIA
 * INTERACTIVE DIAGNOSTIC WIZARD (js/wizard.js)
 * Step-by-step decision tree logic that pinpoints root causes and guides
 * technicians directly to verified solutions.
 */

const IT_WIZARD = {
  tree: {
    start: {
      question: 'What primary symptom is the workstation, server, or user experiencing?',
      options: [
        { label: '🌐 Cannot access internet or network resources', next: 'net_ping_ip' },
        { label: '🪟 Blue Screen of Death (BSoD) or sudden system crash', next: 'bsod_timing' },
        { label: '💻 Machine fails to boot into Windows / Automatic Repair loop', next: 'boot_stage' },
        { label: '🏢 Active Directory, Domain Join, or Login authentication error', next: 'ad_type' },
        { label: '⚡ Severe performance lag / 100% Disk or CPU freeze', next: 'perf_resource' },
        { label: '🖨️ Printer offline, spooler crashing, or queue stuck', next: 'printer_issue' }
      ]
    },

    // -------------------------------------------------------------
    // NETWORK TREE
    // -------------------------------------------------------------
    net_ping_ip: {
      question: 'Open Command Prompt and type: `ping 8.8.8.8`. Do you receive replies?',
      options: [
        { label: '❌ No replies / Request timed out / General failure', next: 'net_check_ip' },
        { label: '✅ Yes! Ping to 8.8.8.8 succeeds with 0% packet loss', next: 'net_ping_hostname' }
      ]
    },

    net_ping_hostname: {
      question: 'Now type: `ping google.com`. Does it resolve and reply?',
      options: [
        {
          label: '❌ Fails: "Ping request could not find host google.com"',
          outcome: {
            title: 'Root Cause: DNS Resolver Failure',
            summary: 'Your network IP routing works, but Domain Name System (DNS) resolution is broken. Your DNS client cache is poisoned or the primary DNS server is unreachable.',
            issueId: 'net-dns-resolution-failure',
            quickCommand: 'ipconfig /flushdns && netsh interface ip set dns "Ethernet" static 8.8.8.8'
          }
        },
        {
          label: '✅ Yes, google.com replies, but internal company portals or VPN fail',
          outcome: {
            title: 'Root Cause: MTU Black Hole or Split-Tunnel Routing Conflict',
            summary: 'The client has valid public internet, but the VPN tunnel or MTU packet size exceeds router boundaries, dropping large packets.',
            issueId: 'net-vpn-split-tunnel-leak',
            quickCommand: 'netsh interface ipv4 set subinterface "VPN" mtu=1350 store=persistent'
          }
        }
      ]
    },

    net_check_ip: {
      question: 'Run `ipconfig`. What does the IPv4 Address look like?',
      options: [
        {
          label: '⚠️ Begins with 169.254.x.x (APIPA Autoconfiguration)',
          outcome: {
            title: 'Root Cause: DHCP Discovery Failure (APIPA)',
            summary: 'The computer received no response from any DHCP server. The DHCP scope is either 100% full, the DHCP service is stopped, or the switchport is assigned to an unrouted VLAN.',
            issueId: 'net-apipa-169',
            quickCommand: 'ipconfig /release && ipconfig /renew'
          }
        },
        {
          label: '⚠️ Windows says "Another computer on this network has the same IP address"',
          outcome: {
            title: 'Root Cause: Duplicate IP Address Conflict',
            summary: 'Two devices share the identical IP address. An unauthorized static IP was configured inside an active DHCP distribution range.',
            issueId: 'net-ip-conflict',
            quickCommand: 'arp -d * && ipconfig /renew'
          }
        },
        {
          label: '✅ Has a normal IP (192.168.x.x or 10.x.x.x), but Default Gateway unreachable',
          outcome: {
            title: 'Root Cause: Corrupted Winsock / Network Stack Hooks',
            summary: 'The physical adapter has an IP lease, but the TCP/IP socket catalog or local software firewall hooks are corrupted.',
            issueId: 'cmd-network-stack-reset',
            quickCommand: 'netsh winsock reset && netsh int ip reset && shutdown /r /t 0'
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // BSOD TREE
    // -------------------------------------------------------------
    bsod_timing: {
      question: 'What is the Stop Code shown on the Blue Screen?',
      options: [
        {
          label: 'CRITICAL_PROCESS_DIED (0x000000EF)',
          outcome: {
            title: 'Root Cause: Core Windows Kernel Process Termination',
            summary: 'A critical Windows process (csrss.exe, svchost, ntoskrnl) crashed due to damaged system components, faulty SSD sectors, or driver corruption.',
            issueId: 'win-bsod-critical-process',
            quickCommand: 'sfc /scannow && dism /online /cleanup-image /restorehealth'
          }
        },
        {
          label: 'IRQL_NOT_LESS_OR_EQUAL (0x0000000A) or DRIVER_IRQL',
          outcome: {
            title: 'Root Cause: Kernel Driver Memory Fault or Bad RAM',
            summary: 'A third-party driver attempted unauthorized memory addressing or physical RAM cells have developed single-bit parity errors.',
            issueId: 'win-bsod-irql',
            quickCommand: 'mdsched.exe'
          }
        },
        {
          label: 'INACCESSIBLE_BOOT_DEVICE (0x0000007B)',
          outcome: {
            title: 'Root Cause: Storage Controller Mismatch (AHCI / RAID VMD)',
            summary: 'Windows kernel cannot read the OS partition during early boot. BIOS SATA/NVMe controller mode does not match the installed driver.',
            issueId: 'win-bsod-inaccessible-boot',
            quickCommand: 'bootrec /fixboot && bcdboot C:\\Windows /l en-us'
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // BOOT STAGE TREE
    // -------------------------------------------------------------
    boot_stage: {
      question: 'How far does the computer progress during power on?',
      options: [
        {
          label: '⚡ Motherboard powers on, black screen, beeps or motherboard debug LED lights up',
          outcome: {
            title: 'Root Cause: Hardware POST Failure (RAM / CPU / GPU)',
            summary: 'System fails Power-On Self Test before BIOS initializes. Reseat memory modules in Slot A2/B2 and clear CMOS.',
            issueId: 'hw-post-beep-matrix',
            quickCommand: 'Power off -> Reseat RAM stick in Slot 2 -> Clear CMOS battery'
          }
        },
        {
          label: '🔄 Loops continually into "Automatic Startup Repair couldn\'t repair your PC"',
          outcome: {
            title: 'Root Cause: Registry Hive Damage or Boot Loop Enforcement',
            summary: 'Windows boot loader detects damaged driver or unreadable SOFTWARE/SYSTEM registry hive in SrtTrail.txt.',
            issueId: 'win-startup-repair-loop',
            quickCommand: 'bcdedit /set {default} recoveryenabled No'
          }
        },
        {
          label: '🔒 Blue screen asks for 48-digit BitLocker Recovery Key every restart',
          outcome: {
            title: 'Root Cause: TPM Platform Configuration Register (PCR) Desync',
            summary: 'Firmware updates or Secure Boot changes altered PCR hashes, causing TPM to withhold the decryption key.',
            issueId: 'win-bitlocker-recovery-loop',
            quickCommand: 'manage-bde -protectors -disable C: -RebootCount 1'
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // ACTIVE DIRECTORY TREE
    // -------------------------------------------------------------
    ad_type: {
      question: 'What specific Active Directory or Identity error occurred?',
      options: [
        {
          label: '"The trust relationship between this workstation and primary domain failed"',
          outcome: {
            title: 'Root Cause: Machine Password Desynchronization',
            summary: 'The workstation computer account password in Active Directory does not match the local LSA secret cache.',
            issueId: 'ad-trust-relationship-failed',
            quickCommand: 'Test-ComputerSecureChannel -Repair -Credential (Get-Credential)'
          }
        },
        {
          label: '"An Active Directory Domain Controller for the domain could not be contacted"',
          outcome: {
            title: 'Root Cause: DNS SRV Record Locator Failure',
            summary: 'Client machine is pointing to public DNS instead of internal Domain Controller DNS IP addresses.',
            issueId: 'ad-domain-join-failure',
            quickCommand: 'nslookup -type=srv _ldap._tcp.dc._msdcs.<domain.com>'
          }
        },
        {
          label: 'User account locks out repeatedly every 5-15 minutes after unlock',
          outcome: {
            title: 'Root Cause: Stale Cached Credential Lockout Storm',
            summary: 'A background scheduled task, smartphone Wi-Fi/email sync, or Windows Credential Manager is transmitting an expired password.',
            issueId: 'ad-account-lockout-storm',
            quickCommand: 'Get-WinEvent -FilterHashtable @{LogName=\'Security\';Id=4740} -MaxEvents 5'
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // PERFORMANCE TREE
    // -------------------------------------------------------------
    perf_resource: {
      question: 'Open Task Manager (Ctrl+Shift+Esc). What is maxed out at 100%?',
      options: [
        {
          label: '📊 Disk Usage is pegged at 100%, but Read/Write speed is under 1 MB/s',
          outcome: {
            title: 'Root Cause: StorAHCI.sys MSI Interrupt Bug / SysMain Thrashing',
            summary: 'Standard SATA AHCI controller fails under Message Signaled Interrupts, repeatedly resetting the storage device bus.',
            issueId: 'win-100-disk-usage',
            quickCommand: 'Stop-Service -Name SysMain -Force; Set-Service -Name SysMain -StartupType Disabled'
          }
        },
        {
          label: '🌡️ CPU clocks throttle down to 0.79 GHz and fans scream at maximum RPM',
          outcome: {
            title: 'Root Cause: CPU Thermal Throttling / Failed Cooler Pump',
            summary: 'CPU temperature has hit the 100°C PROCHOT limit. Thermal paste is desiccated or AIO liquid cooler pump is dead.',
            issueId: 'hw-thermal-throttling',
            quickCommand: 'Inspect AIO_PUMP RPM in BIOS and repaste with Arctic MX-6'
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // PRINTER TREE
    // -------------------------------------------------------------
    printer_issue: {
      question: 'What is happening with the printer?',
      options: [
        {
          label: '⚠️ "The local print spooler service is not running" / Spooler stops constantly',
          outcome: {
            title: 'Root Cause: Corrupted SPL/SHD File or Faulty Type 3 Driver',
            summary: 'A corrupted binary print job is stuck in C:\\Windows\\System32\\spool\\PRINTERS, crashing spoolsv.exe on launch.',
            issueId: 'win-print-spooler-crash',
            quickCommand: 'net stop spooler && del /Q /F /S "%systemroot%\\System32\\spool\\PRINTERS\\*.*" && net start spooler'
          }
        }
      ]
    }
  },

  /**
   * Get current state object
   */
  getState(nodeKey) {
    return this.tree[nodeKey] || null;
  }
};

window.IT_WIZARD = IT_WIZARD;
