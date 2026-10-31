/**
 * TITAN IT - THE ULTIMATE ENTERPRISE IT & TROUBLESHOOTING ENCYCLOPEDIA
 * INTERACTIVE IT TOOLS (js/tools.js)
 * - Subnet Calculator (CIDR, Netmask, Broadcast, Usable IPs)
 * - Custom Batch Script Generator (Nuclear Network Reset, Spooler Fix, DISM/SFC)
 * - RAID Capacity & Fault Tolerance Calculator
 * - Enterprise Ports Quick Lookup
 */

const IT_TOOLS = {
  // Common Port Database
  ports: [
    { port: 20, proto: 'TCP', service: 'FTP Data', desc: 'File Transfer Protocol (Data Transfer)' },
    { port: 21, proto: 'TCP', service: 'FTP Control', desc: 'File Transfer Protocol (Command/Control)' },
    { port: 22, proto: 'TCP', service: 'SSH / SFTP', desc: 'Secure Shell & Secure File Transfer' },
    { port: 23, proto: 'TCP', service: 'Telnet', desc: 'Unencrypted remote text communications (Legacy)' },
    { port: 25, proto: 'TCP', service: 'SMTP', desc: 'Simple Mail Transfer Protocol (Mail routing)' },
    { port: 53, proto: 'TCP/UDP', service: 'DNS', desc: 'Domain Name System resolution and zone transfer' },
    { port: 67, proto: 'UDP', service: 'DHCP Server', desc: 'Dynamic Host Configuration Protocol (Server listener)' },
    { port: 68, proto: 'UDP', service: 'DHCP Client', desc: 'DHCP client broadcast reception' },
    { port: 80, proto: 'TCP', service: 'HTTP', desc: 'Hypertext Transfer Protocol (Web)' },
    { port: 88, proto: 'TCP/UDP', service: 'Kerberos', desc: 'Active Directory Kerberos authentication v5' },
    { port: 123, proto: 'UDP', service: 'NTP', desc: 'Network Time Protocol (Domain clock sync)' },
    { port: 135, proto: 'TCP', service: 'RPC Endpoint', desc: 'Microsoft RPC Endpoint Mapper (DCOM)' },
    { port: 137, proto: 'UDP', service: 'NetBIOS Name', desc: 'NetBIOS Name Service' },
    { port: 139, proto: 'TCP', service: 'NetBIOS Session', desc: 'NetBIOS Session Service' },
    { port: 389, proto: 'TCP/UDP', service: 'LDAP', desc: 'Lightweight Directory Access Protocol' },
    { port: 443, proto: 'TCP', service: 'HTTPS / TLS', desc: 'HTTP over TLS/SSL (Secure Web)' },
    { port: 445, proto: 'TCP', service: 'SMB', desc: 'Server Message Block (Windows File Sharing)' },
    { port: 500, proto: 'UDP', service: 'ISAKMP / IKE', desc: 'IPsec VPN Key Exchange phase 1' },
    { port: 636, proto: 'TCP', service: 'LDAPS', desc: 'LDAP over SSL' },
    { port: 993, proto: 'TCP', service: 'IMAPS', desc: 'Internet Message Access Protocol over SSL' },
    { port: 1433, proto: 'TCP', service: 'MS SQL Server', desc: 'Microsoft SQL Database Default Port' },
    { port: 3268, proto: 'TCP', service: 'AD Global Catalog', desc: 'Active Directory Global Catalog queries' },
    { port: 3389, proto: 'TCP/UDP', service: 'RDP', desc: 'Remote Desktop Protocol' },
    { port: 4500, proto: 'UDP', service: 'IPsec NAT-T', desc: 'IPsec NAT Traversal' },
    { port: 5985, proto: 'TCP', service: 'WinRM HTTP', desc: 'Windows Remote Management (PowerShell Remoting)' },
    { port: 5986, proto: 'TCP', service: 'WinRM HTTPS', desc: 'Windows Remote Management over SSL' },
    { port: 8080, proto: 'TCP', service: 'HTTP Proxy / Dev', desc: 'Alternative HTTP Web & Proxy Port' }
  ],

  /**
   * Calculate IPv4 Subnet parameters from IP and CIDR
   */
  calculateSubnet(ipStr, cidr) {
    cidr = parseInt(cidr, 10);
    const ipParts = ipStr.trim().split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }

    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;
    const netNum = (ipNum & maskNum) >>> 0;
    const bcastNum = (netNum | wildcardNum) >>> 0;

    const numToIp = (n) => [
      (n >>> 24) & 255,
      (n >>> 16) & 255,
      (n >>> 8) & 255,
      n & 255
    ].join('.');

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstUsable = cidr >= 31 ? netNum : netNum + 1;
    const lastUsable = cidr >= 31 ? bcastNum : bcastNum - 1;

    // Detect Class
    let ipClass = 'Unknown';
    if (ipParts[0] >= 1 && ipParts[0] <= 126) ipClass = 'Class A (Unicast)';
    else if (ipParts[0] === 127) ipClass = 'Loopback';
    else if (ipParts[0] >= 128 && ipParts[0] <= 191) ipClass = 'Class B (Unicast)';
    else if (ipParts[0] >= 192 && ipParts[0] <= 223) ipClass = 'Class C (Unicast)';
    else if (ipParts[0] >= 224 && ipParts[0] <= 239) ipClass = 'Class D (Multicast)';
    else if (ipParts[0] >= 240) ipClass = 'Class E (Experimental)';

    return {
      ip: ipStr,
      cidr: cidr,
      netmask: numToIp(maskNum),
      wildcard: numToIp(wildcardNum),
      network: numToIp(netNum),
      broadcast: numToIp(bcastNum),
      firstUsable: numToIp(firstUsable),
      lastUsable: numToIp(lastUsable),
      usableHosts: usableHosts.toLocaleString(),
      totalHosts: totalHosts.toLocaleString(),
      ipClass: ipClass
    };
  },

  /**
   * Calculate RAID Capacity
   */
  calculateRaid(type, diskCount, diskSize) {
    diskCount = parseInt(diskCount, 10);
    diskSize = parseFloat(diskSize);

    if (isNaN(diskCount) || isNaN(diskSize) || diskCount < 1 || diskSize <= 0) {
      return { error: 'Invalid disk configuration.' };
    }

    let usable = 0;
    let faultTolerance = 0;
    let description = '';

    switch (type) {
      case '0': // RAID 0 (Striping)
        if (diskCount < 2) return { error: 'RAID 0 requires at least 2 disks.' };
        usable = diskCount * diskSize;
        faultTolerance = 0;
        description = 'Zero fault tolerance. If any single disk fails, ALL data is lost. Maximum read/write performance.';
        break;

      case '1': // RAID 1 (Mirroring)
        if (diskCount < 2) return { error: 'RAID 1 requires at least 2 disks.' };
        usable = diskSize; // Mirrors capacity of 1 disk
        faultTolerance = diskCount - 1;
        description = 'Mirrored storage. Excellent fault tolerance. Capacity limited to single drive size.';
        break;

      case '5': // RAID 5 (Distributed Parity)
        if (diskCount < 3) return { error: 'RAID 5 requires at least 3 disks.' };
        usable = (diskCount - 1) * diskSize;
        faultTolerance = 1;
        description = 'Single-drive parity. Can withstand 1 drive failure without data loss. High read performance.';
        break;

      case '6': // RAID 6 (Dual Distributed Parity)
        if (diskCount < 4) return { error: 'RAID 6 requires at least 4 disks.' };
        usable = (diskCount - 2) * diskSize;
        faultTolerance = 2;
        description = 'Dual parity blocks. Can withstand simultaneous failure of any 2 disks. Standard for enterprise SAN/NAS.';
        break;

      case '10': // RAID 10 (1+0 Striped Mirrors)
        if (diskCount < 4 || diskCount % 2 !== 0) return { error: 'RAID 10 requires an even number of disks (minimum 4).' };
        usable = (diskCount / 2) * diskSize;
        faultTolerance = 1; // At least 1, up to N/2 if in opposite mirror sets
        description = 'Striped mirrors. Can tolerate 1 drive failure per mirror set. Premier performance & redundancy.';
        break;

      default:
        return { error: 'Select a valid RAID type.' };
    }

    const rawCapacity = diskCount * diskSize;
    const efficiency = ((usable / rawCapacity) * 100).toFixed(1);

    return {
      usable: usable.toFixed(2),
      raw: rawCapacity.toFixed(2),
      faultTolerance: faultTolerance,
      efficiency: efficiency,
      description: description
    };
  },

  /**
   * Generate Custom Windows Batch Script
   */
  generateBatchScript(options) {
    let script = '@echo off\n:: =========================================================\n';
    script += ':: TITAN IT - AUTOMATED WORKSTATION REPAIR PIPELINE\n';
    script += ':: Generated: ' + new Date().toLocaleDateString() + '\n';
    script += ':: Run as Administrator\n';
    script += ':: =========================================================\necho Initializing Admin Elevation Check...\n';
    script += 'net session >nul 2>&1\nif %errorLevel% neq 0 (\n  echo [ERROR] Must run as Administrator! Right-click and Run as Administrator.\n  pause\n  exit /b\n)\n\n';

    if (options.flushDns) {
      script += 'echo [1/8] Flushing and Registering DNS Cache...\n';
      script += 'ipconfig /flushdns\n';
      script += 'ipconfig /registerdns\n\n';
    }

    if (options.dhcpRenew) {
      script += 'echo [2/8] Releasing and Renewing DHCP Leases...\n';
      script += 'ipconfig /release\n';
      script += 'ipconfig /renew\n\n';
    }

    if (options.resetWinsock) {
      script += 'echo [3/8] Resetting Winsock Catalog and TCP/IP Stack...\n';
      script += 'netsh winsock reset\n';
      script += 'netsh int ip reset\n';
      script += 'netsh interface ipv4 reset\n';
      script += 'netsh interface ipv6 reset\n\n';
    }

    if (options.clearArp) {
      script += 'echo [4/8] Flushing ARP and NetBIOS Caches...\n';
      script += 'arp -d *\n';
      script += 'nbtstat -R\n';
      script += 'nbtstat -RR\n\n';
    }

    if (options.fixSpooler) {
      script += 'echo [5/8] Resetting Windows Print Spooler and Clearing Stuck Jobs...\n';
      script += 'net stop spooler\n';
      script += 'del /Q /F /S "%systemroot%\\System32\\spool\\PRINTERS\\*.*"\n';
      script += 'net start spooler\n\n';
    }

    if (options.sfcDism) {
      script += 'echo [6/8] Executing SFC and DISM Component Store Health Repair...\n';
      script += 'dism /online /cleanup-image /restorehealth\n';
      script += 'sfc /scannow\n\n';
    }

    if (options.restartSysMain) {
      script += 'echo [7/8] Disabling SysMain (Superfetch) Disk Thrashing...\n';
      script += 'sc config "SysMain" start=disabled\n';
      script += 'sc stop "SysMain"\n\n';
    }

    script += 'echo =========================================================\n';
    script += 'echo [COMPLETE] All requested repair operations finished!\n';
    script += 'echo =========================================================\n';

    if (options.rebootPrompt) {
      script += 'set /p choice="Reboot computer now to finalize changes? (Y/N): "\n';
      script += 'if /i "%choice%"=="Y" shutdown /r /t 5 /c "Titan IT Maintenance Reboot"\n';
    } else {
      script += 'pause\n';
    }

    return script;
  }
};

window.IT_TOOLS = IT_TOOLS;
