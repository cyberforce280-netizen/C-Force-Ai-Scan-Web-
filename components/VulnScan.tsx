
import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, ScanLine, FileWarning, Terminal, 
  ShieldAlert, Lock, Server, Activity, ChevronRight, ChevronDown, 
  Info, AlertOctagon, Search, Shield, Flame, Unlock, 
  Maximize2, Minus, X, Zap, Hash
} from 'lucide-react';

// --- Types ---

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type Category = 'MISCONFIG' | 'EXPOSED' | 'OUTDATED' | 'SSL' | 'CVE' | 'INFO_DISC';

interface VulnFinding {
  id: string;
  title: string;
  severity: Severity;
  cvss: number;
  component: string;
  description: string;
  category: Category;
  method: string;
}

interface TerminalLine {
  id: number;
  text: string;
  type: 'input' | 'output' | 'success' | 'error' | 'warning' | 'system' | 'prompt';
}

interface CategoryGroup {
  id: Category;
  label: string;
  icon: any;
}

// --- Mock Data ---

const MOCK_FINDINGS: VulnFinding[] = [
  {
    id: 'V-102',
    title: 'Apache 2.4.49 Path Traversal',
    severity: 'CRITICAL',
    cvss: 9.8,
    component: 'Web Server (Apache)',
    description: 'Version 2.4.49 is vulnerable to path traversal (CVE-2021-41773). Immediate patching required.',
    category: 'CVE',
    method: 'Passive Banner Analysis'
  },
  {
    id: 'V-205',
    title: 'Exposed .git Directory',
    severity: 'HIGH',
    cvss: 7.5,
    component: 'Web Root',
    description: 'Publicly accessible .git repository allows reconstruction of source code.',
    category: 'INFO_DISC',
    method: 'Passive URI Check'
  },
  {
    id: 'V-310',
    title: 'Open Port 3389 (RDP)',
    severity: 'HIGH',
    cvss: 7.1,
    component: 'Network / Firewall',
    description: 'Remote Desktop Protocol exposed to public internet. High risk of brute-force attacks.',
    category: 'EXPOSED',
    method: 'Passive Port Sweep'
  },
  {
    id: 'V-401',
    title: 'Missing HSTS Header',
    severity: 'MEDIUM',
    cvss: 4.5,
    component: 'HTTP Response',
    description: 'Strict-Transport-Security header not present, allowing potential SSL stripping.',
    category: 'MISCONFIG',
    method: 'Header Analysis'
  }
];

const CATEGORIES: CategoryGroup[] = [
  { id: 'MISCONFIG', label: 'Security Misconfigurations', icon: FileWarning },
  { id: 'EXPOSED', label: 'Exposed Services', icon: Server },
  { id: 'OUTDATED', label: 'Outdated Software', icon: Activity },
  { id: 'SSL', label: 'SSL / TLS Issues', icon: Lock },
  { id: 'CVE', label: 'Known CVEs', icon: AlertOctagon },
  { id: 'INFO_DISC', label: 'Information Disclosure', icon: Info },
];

// --- Helpers ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanUrl = (url: string) => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

// --- Component ---

export const VulnScan: React.FC = () => {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [findings, setFindings] = useState<VulnFinding[]>([]);
  const [expandedCats, setExpandedCats] = useState<Record<Category, boolean>>({
    'MISCONFIG': true, 'EXPOSED': true, 'OUTDATED': true, 'SSL': true, 'CVE': true, 'INFO_DISC': true
  });

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { id: 1, text: 'C-FORCE OFFENSIVE SECURITY SUITE [v2.4.0]', type: 'system' },
    { id: 2, text: 'Authorized Access Only. All actions logged.', type: 'warning' },
    { id: 3, text: 'Type "help" for available commands.', type: 'system' },
  ]);
  const [cmdInput, setCmdInput] = useState('');
  
  // Terminal Context State
  const [termContext, setTermContext] = useState<'ROOT' | 'MSF' | 'MODULE' | 'METERPRETER'>('ROOT');
  const [currentModule, setCurrentModule] = useState('');
  
  // Ref for ddos interval to clear it on unmount or stop
  const ddosIntervalRef = useRef<number | null>(null);
  
  // Helper to get the current prompt label based on state
  const getPromptLabel = () => {
    if (termContext === 'ROOT') return 'root@cforce:~#';
    if (termContext === 'MSF') return 'msf6 >';
    if (termContext === 'MODULE') return `msf6 exploit(${currentModule.split('/').pop()}) >`;
    if (termContext === 'METERPRETER') return 'meterpreter >';
    return '> ';
  };

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Focus terminal input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (ddosIntervalRef.current) clearInterval(ddosIntervalRef.current);
    };
  }, []);

  const toggleCategory = (cat: Category) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-amber-600 text-black';
      case 'LOW': return 'bg-blue-600 text-white';
      case 'INFO': return 'bg-cyan-600 text-black';
    }
  };

  // --- Terminal Logic ---

  const writeLine = (text: string, type: TerminalLine['type'] = 'output') => {
    setTerminalHistory(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  // Function to actually execute logic (exposed to buttons and manual input)
  const executeCommand = async (cmd: string) => {
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;

    // Use current state for prompt
    let currentLabel = getPromptLabel();

    // Echo Input
    writeLine(`${currentLabel} ${cleanCmd}`, 'input');
    
    const args = cleanCmd.split(' ');
    const command = args[0].toLowerCase();

    // --- Smart Context Switching ---
    // If user tries to use MSF commands from ROOT, auto-launch MSF
    let effectiveContext = termContext;
    if (termContext === 'ROOT' && ['use', 'search', 'show', 'set'].includes(command)) {
      writeLine('[*] Starting Metasploit Framework...', 'system');
      await wait(500);
      setTermContext('MSF');
      effectiveContext = 'MSF';
      // We continue to process the command in the new context
    }

    // --- Global Commands ---
    if (command === 'clear') {
       setTerminalHistory([]);
       return;
    }

    if (command === 'exit' || command === 'quit') {
       if (effectiveContext === 'METERPRETER') {
           writeLine('[*] Shutting down Meterpreter session...', 'system');
           setTermContext('MSF');
       } else if (effectiveContext === 'MODULE') {
           setTermContext('MSF');
           setCurrentModule('');
       } else if (effectiveContext === 'MSF') {
           setTermContext('ROOT');
       } else {
           writeLine('Logout', 'system');
       }
       return;
    }

    if (command === 'back') {
       if (effectiveContext === 'METERPRETER') {
         setTermContext('MSF');
         writeLine('[*] Backgrounding session...', 'warning');
       } else if (effectiveContext === 'MODULE') {
         setTermContext('MSF');
         setCurrentModule('');
       } else {
         writeLine('Already at root level.', 'warning');
       }
       return;
    }

    // --- CONTEXT: ROOT SHELL ---
    if (effectiveContext === 'ROOT') {
       switch (command) {
         case 'help':
           writeLine('Available Commands (ROOT):', 'system');
           writeLine('  scan <target>    : Start passive vulnerability scan', 'output');
           writeLine('  msfconsole       : Launch Metasploit Framework', 'output');
           writeLine('  wpscan <target>  : Start WPScan enumeration', 'output');
           writeLine('  hydra <target>   : Start SSH Brute Force', 'output');
           writeLine('  python3 exados.py: Start EXADOS SUPER DDoS', 'output');
           break;
         case 'scan': 
           if (args[1]) setTarget(args[1]);
           startScan(args[1] || target); 
           break;
         case 'msfconsole':
           writeLine(`
     ,           ,
    /             \\
   ((__-^^-,-^^-__))
    \`-_---' \`---_-'
     \`--|o\` 'o|--'
        \\  \`  /
         ): :(
         :o_o:
          "-"
`, 'output');
           writeLine('C-Force Metasploit Framework v6.3.4-dev', 'system');
           writeLine('[*] Starting the Metasploit Framework console...', 'output');
           setTermContext('MSF');
           break;
         case 'wpscan': runBruteForce(); break;
         case 'hydra': runSSHBruteForce(); break;
         case 'hping3': 
         case 'ddos':
         case 'exados':
           runDDoS(); 
           break;
         default: writeLine(`bash: ${command}: command not found`, 'error');
       }
       return;
    }

    // --- CONTEXT: METASPLOIT (MSF & MODULE) ---
    if (effectiveContext === 'MSF' || effectiveContext === 'MODULE') {
       switch (command) {
         case 'help':
           writeLine('Core Commands:', 'system');
           writeLine('  use <module>     : Select an exploit module', 'output');
           writeLine('  search <term>    : Search for modules', 'output');
           writeLine('  sessions -i <id> : Interact with a session', 'output');
           writeLine('  show <type>      : Show info (payloads, options, targets)', 'output');
           writeLine('  set <opt> <val>  : Set a context variable', 'output');
           writeLine('  check            : Check if target is vulnerable', 'output');
           writeLine('  exploit / run    : Launch the attack', 'output');
           break;
         
         case 'search':
           writeLine(`Matching Modules (${args[1] || 'all'}):`, 'system');
           writeLine('   #  Name                                  Disclosure Date  Rank     Check  Description', 'output');
           writeLine('   -  ----                                  ---------------  ----     -----  -----------', 'output');
           writeLine('   0  exploit/multi/http/apache_normalize   2021-10-05       excellent  Yes    Apache Path Traversal', 'output');
           writeLine('   1  exploit/windows/smb/ms17_010_eternal  2017-03-14       average    Yes    MS17-010 EternalBlue', 'output');
           break;

         case 'use':
           if (!args[1]) { writeLine('Usage: use <module_name>', 'error'); break; }
           setCurrentModule(args[1]);
           setTermContext('MODULE');
           writeLine(`[*] Using configured payload generic/shell_reverse_tcp`, 'output');
           break;

         case 'show':
           if (args[1] === 'payloads') {
              writeLine('Compatible Payloads:', 'system');
              writeLine('   Name                                 Description', 'output');
              writeLine('   ----                                 -----------', 'output');
              writeLine('   linux/x64/meterpreter/reverse_tcp    Inject meterpreter server (Linux x64)', 'output');
              writeLine('   linux/x64/shell/reverse_tcp          Spawn a command shell (Linux x64)', 'output');
              writeLine('   generic/shell_reverse_tcp            Connect back to attacker and spawn a shell', 'output');
              writeLine('   php/meterpreter/reverse_tcp          Run a meterpreter server in PHP', 'output');
              writeLine('   windows/x64/meterpreter/reverse_tcp  Inject meterpreter server (Windows x64)', 'output');
              writeLine('   java/jsp_shell_reverse_tcp           Connect back via JSP shell', 'output');
           } else if (args[1] === 'options') {
              writeLine('Module Options:', 'system');
              writeLine('   Name     Current Setting  Required  Description', 'output');
              writeLine('   ----     ---------------  --------  -----------', 'output');
              writeLine(`   RHOSTS   ${target || ''}           yes       The target address`, 'output');
              writeLine('   RPORT    80               yes       The target port', 'output');
              writeLine('   LHOST    10.0.0.5         yes       The listen address', 'output');
           } else {
              writeLine('Usage: show [payloads|options|targets]', 'warning');
           }
           break;

         case 'set':
           if (args[1] && args[2]) {
              if (args[1].toUpperCase() === 'PAYLOAD') {
                 writeLine(`PAYLOAD => ${args[2]}`, 'output');
              } else if (args[1].toUpperCase() === 'RHOSTS') {
                 setTarget(args[2]);
                 writeLine(`RHOSTS => ${args[2]}`, 'output');
              } else {
                 writeLine(`${args[1].toUpperCase()} => ${args[2]}`, 'output');
              }
           } else {
              writeLine('Usage: set <option> <value>', 'error');
           }
           break;
        
         case 'check':
            if (effectiveContext !== 'MODULE') { writeLine('[-] No module selected.', 'error'); break; }
            if (!target) { writeLine('[-] RHOSTS not set.', 'error'); break; }
            writeLine(`[*] Validating target ${target}...`, 'output');
            await wait(1000);
            if (target.includes('gov')) {
               writeLine(`[-] ${target}:80 - The target is NOT vulnerable.`, 'error');
            } else {
               writeLine(`[+] ${target}:80 - The target is vulnerable.`, 'success');
            }
            break;

         case 'exploit':
         case 'run':
            if (effectiveContext !== 'MODULE') { writeLine('[-] No module selected.', 'error'); break; }
            if (!target) { writeLine('[-] RHOSTS not set.', 'error'); break; }
            
            writeLine(`[*] Started reverse TCP handler on 10.0.0.5:4444`, 'output');
            writeLine(`[*] Sending stage (12901 bytes) to ${target}`, 'output');
            await wait(1500);
            
            // Realism: Fail on gov/random sites unless it's a test IP
            const isRealisticTarget = target.includes('test') || target.includes('demo') || target.match(/^(192|10|127)\./);
            
            if (isRealisticTarget) {
               writeLine(`[+] Meterpreter session 1 opened (10.0.0.5:4444 -> ${target}:56732)`, 'success');
            } else {
               writeLine(`[-] Exploit failed: Connection timed out. Target may be patched or behind WAF.`, 'error');
               writeLine(`[*] Exploit completed, but no session was created.`, 'system');
            }
            break;

         case 'sessions':
            if (args[1] === '-i') {
               const sessionId = args[2];
               if (sessionId === '1') {
                  // Only allow interaction if we actually got a session (simulated via boolean check or just allow it for demo feeling if user insists)
                  writeLine(`[*] Starting interaction with 1...`, 'output');
                  setTermContext('METERPRETER');
               } else {
                  writeLine(`[-] Error: No session with ID ${sessionId || ''}`, 'error');
               }
            } else if (args[1] === '-l' || args.length === 1) {
               writeLine('Active sessions:', 'system');
               writeLine('  Id  Type                     Information                            Connection', 'output');
               writeLine('  --  ----                     -----------                            ----------', 'output');
               // Show session only if we "hacked" it, or for demo purposes show empty
               writeLine('  No active sessions.', 'output');
            } else {
               writeLine('Usage: sessions -i <id> OR sessions -l', 'error');
            }
            break;

         default:
           writeLine(`[-] Unknown command: ${command}`, 'error');
       }
       return;
    }

    // --- CONTEXT: METERPRETER ---
    if (effectiveContext === 'METERPRETER') {
       switch (command) {
          case 'help':
             writeLine('Meterpreter Commands:', 'system');
             writeLine('  sysinfo   : Get system information', 'output');
             writeLine('  getuid    : Get user ID', 'output');
             writeLine('  hashdump  : Dump SAM database', 'output');
             writeLine('  shell     : Drop into system shell', 'output');
             writeLine('  background: Background current session', 'output');
             break;
          case 'sysinfo':
             writeLine('Computer     : CFORCE_TARGET_01', 'output');
             writeLine('OS           : Linux 5.4.0-89-generic (x64)', 'output');
             writeLine('Architecture : x64', 'output');
             writeLine('Meterpreter  : x64/linux', 'output');
             break;
          case 'getuid':
             writeLine('Server username: root', 'success');
             break;
          case 'hashdump':
             writeLine('[*] Dumping password hashes...', 'warning');
             await wait(1000);
             writeLine('root:$6$rounds=5000$Usesomesillystring$D4I06s.f.:0:0:root:/root:/bin/bash', 'output');
             break;
          case 'shell':
             writeLine('Process 2301 created.', 'output');
             writeLine('Channel 1 created.', 'output');
             writeLine('# whoami', 'input');
             writeLine('root', 'output');
             break;
          case 'background':
             setTermContext('MSF');
             writeLine('Backgrounding session 1...', 'warning');
             break;
          default:
             writeLine(`[-] Unknown command: ${command}`, 'error');
       }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(cmdInput);
      setCmdInput('');
    }
  };

  // --- Actions ---

  const startScan = (scanTarget: string = target) => {
    if (!scanTarget) {
      writeLine('Error: No target specified.', 'error');
      return;
    }
    
    setIsScanning(true);
    setScanComplete(false);
    setFindings([]);

    const steps = [
      { delay: 100, msg: `[*] Starting passive scan on ${scanTarget}`, type: 'system' },
      { delay: 800, msg: '[+] Resolving DNS...', type: 'output' },
      { delay: 1500, msg: '[+] Checking port reachability...', type: 'output' },
      { delay: 2200, msg: '[*] Banner grabbing active...', type: 'output' },
      { delay: 3000, msg: '[!] WARN: Suspicious header detected (Apache/2.4.49)', type: 'warning' },
      { delay: 4000, msg: '[+] Analyzing SSL/TLS chain...', type: 'output' },
      { delay: 5000, msg: '[+] Correlating with CVE database...', type: 'output' },
      { delay: 6000, msg: '[!] CRITICAL: CVE-2021-41773 CONFIRMED', type: 'error' },
      { delay: 7000, msg: '[*] Scan finished. Report generated.', type: 'success' },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        // @ts-ignore
        writeLine(step.msg, step.type);
        if (index === steps.length - 1) {
          setIsScanning(false);
          setScanComplete(true);
          setFindings(MOCK_FINDINGS);
        }
      }, step.delay);
    });
  };

  const runMetasploit = async () => {
    if (!target) {
      writeLine('Error: Set target first.', 'error');
      return;
    }
    setIsAttacking(true);
    
    // Auto-fix URL for command display
    const cleanTgt = cleanUrl(target);

    // 1. Launch Console (Changes State to MSF)
    if (termContext === 'ROOT') {
        await executeCommand('msfconsole');
        await wait(1200); 
    }
    
    setTermContext('MSF'); 
    await wait(500);
    
    await executeCommand('use exploit/multi/http/apache_normalize_path');
    setTermContext('MODULE');
    setCurrentModule('exploit/multi/http/apache_normalize_path');
    await wait(800);
    
    await executeCommand(`set RHOSTS ${cleanTgt}`);
    await wait(800);
    
    await executeCommand('check');
    await wait(1500);
    
    await executeCommand('run');
    
    setIsAttacking(false);
  };

  const runBruteForce = async () => {
    if (!target) {
      writeLine('Error: Set target first.', 'error');
      return;
    }
    setIsAttacking(true);
    setTermContext('ROOT');
    
    const cleanTgt = cleanUrl(target);
    
    // Determine dynamic username based on domain
    let detectedUser = 'admin';
    if (!/^\d{1,3}\./.test(cleanTgt)) {
       const parts = cleanTgt.split('.');
       if (parts[0] && parts[0] !== 'www') {
           detectedUser = parts[0]; // e.g., 'example' from example.com
       }
    }

    // STEP 1: ENUMERATION
    writeLine(`root@cforce:~# wpscan --url http://${cleanTgt} --enumerate u`, 'input');
    await wait(1000);
    
    writeLine(`_______________________________________________________________`, 'output');
    writeLine(`         __          _______   _____can`, 'output');
    writeLine(`         \\ \\        / /  __ \\ / ____|`, 'output');
    writeLine(`_______________________________________________________________`, 'output');
    writeLine(`[+] URL: http://${cleanTgt}/`, 'output');
    await wait(1000);
    
    // Realistic Check
    const isVulnerable = cleanTgt.includes('test') || cleanTgt.includes('demo') || cleanTgt.includes('localhost') || /^(192|10|127)\./.test(cleanTgt);
    
    if (isVulnerable) {
        writeLine(`[i] User(s) Identified:`, 'success');
        writeLine(`[+] ${detectedUser}`, 'warning');
        writeLine(` | ID: 1`, 'output');
    } else {
        // Even in failure, show we TRIED to find that user
        writeLine(`[!] Passive enumeration incomplete.`, 'warning');
        writeLine(`[!] Attempting brute force on detected author archive: '${detectedUser}'`, 'system');
        await wait(1500);
        writeLine(`[i] User(s) Identified:`, 'success');
        writeLine(`[+] ${detectedUser}`, 'warning');
    }
    
    await wait(1500);

    // STEP 2: PASSWORD ATTACK
    writeLine(`root@cforce:~# wpscan --url http://${cleanTgt} --usernames ${detectedUser} --passwords /usr/share/wordlists/rockyou.txt`, 'input');
    await wait(1000);
    writeLine(`[+] Performing password attack on Wp-Login against 1 user/s`, 'system');
    writeLine(`[+] Wordlist: rockyou.txt`, 'output');
    await wait(1000);

    const attempts = [
      { pass: '123456', success: false },
      { pass: 'password', success: false },
      { pass: `${detectedUser}123`, success: false },
      { pass: 'P@ssw0rd123', success: isVulnerable }, // Only succeed if vulnerable
      { pass: 'welcome1', success: false },
      { pass: 'letmein', success: false },
    ];

    for (const attempt of attempts) {
      await wait(200 + Math.random() * 300); 
      if (attempt.success) {
        writeLine(`[SUCCESS] Password Found!`, 'success');
        writeLine(` | Username: ${detectedUser}`, 'success');
        writeLine(` | Password: ${attempt.pass}`, 'success');
        setIsAttacking(false);
        return;
      } else {
        writeLine(`[ATTEMPT] ${detectedUser} : ${attempt.pass} ... Failed`, 'error');
      }
    }
    
    if (!isVulnerable) {
        writeLine(`[!] Reached end of wordlist. No valid password found.`, 'error');
        writeLine(`[*] Scan finished with 0 credentials.`, 'system');
    }
    
    setIsAttacking(false);
  };

  const runSSHBruteForce = async () => {
    if (!target) {
      writeLine('Error: Set target first.', 'error');
      return;
    }
    setIsAttacking(true);
    setTermContext('ROOT');
    
    const cleanTgt = cleanUrl(target);

    writeLine(`root@cforce:~# hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://${cleanTgt}`, 'input');
    await wait(1000);
    writeLine(`Hydra v9.1 (c) 2020 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.`, 'system');
    await wait(500);
    writeLine(`[DATA] max 16 tasks, 1 server, 10 login tries (l:1/p:10), ~1 tries per task`, 'output');
    writeLine(`[DATA] attacking ssh://${cleanTgt}:22/`, 'output');
    await wait(1000);

    const attempts = [
      { pass: '123456', success: false },
      { pass: 'password', success: false },
      { pass: 'root', success: false },
      { pass: 'admin', success: false },
      { pass: 'qwerty', success: false },
      { pass: 'master', success: target.includes('test') || target.includes('demo') || target.includes('10.') },
    ];

    for (const attempt of attempts) {
      await wait(400 + Math.random() * 400); 
      if (attempt.success) {
        writeLine(`[22][ssh] host: ${cleanTgt}   login: root   password: ${attempt.pass}`, 'success');
        writeLine(`[STATUS] attack finished: 1 valid password found`, 'system');
        setIsAttacking(false);
        return;
      } else {
         // Optionally show failed attempts
      }
    }
    
    writeLine(`[DATA] 0 valid passwords found`, 'warning');
    setIsAttacking(false);
  };

  const runDDoS = async () => {
    if (!target) {
      writeLine('Error: Set target first.', 'error');
      return;
    }
    
    const cleanTgt = cleanUrl(target);
    setIsAttacking(true);
    setTermContext('ROOT');

    // EXADOS SUPER DDoS LOGIC PORT
    
    // 1. Launch Script
    writeLine(`root@cforce:~# python3 exados.py`, 'input');
    await wait(800);
    setTerminalHistory(prev => []); // Clear screen for effect like os.system('cls')
    
    // 2. Banner
    writeLine(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  ███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ███████╗       ║
║  ██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔═══██╗██╔════╝       ║
║  █████╗   ╚███╔╝ ███████║██║  ██║██║   ██║███████╗       ║
║  ██╔══╝   ██╔██╗ ██╔══██║██║  ██║██║   ██║╚════██║       ║
║  ███████╗██╔╝ ██╗██║  ██║██████╔╝╚██████╔╝███████║       ║
║  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝       ║
║                                                          ║
║           E X A D O S   S U P E R   D D O S   V 3 0      ║
║           WITH VIP & TLS ADVANCED METHODS                ║
║           DEVELOPED BY cyberForce                        ║
║           CHANNEL: @Cyberforce_280                       ║
║           ⚠️  EXTREME POWER - USE WITH CAUTION ⚠️       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`, 'error');


    await wait(800);
    writeLine('Welcome to EXADOS SUPER DDoS Tool v30.0', 'output');
    writeLine('============================================================', 'warning');
    writeLine('⚠️  VIP & TLS EDITION - EXTREME POWER WARNING! ⚠️', 'error');
    writeLine('============================================================', 'warning');
    await wait(500);

    // 3. Menu
    writeLine(`
[1-10] STANDARD METHODS:
[1] HTTP-GET Flood       [2] HTTP-POST Flood
[3] HTTPS-GET Flood      [4] HTTPS-POST Flood  
[5] TCP SYN Flood        [6] UDP Flood
[7] Slowloris Attack     [8] RUDY Attack
[9] LOIC-Style Attack    [10] Mixed All Methods

[ADVANCED METHODS]
[11] GFLOOD Bypass        - Advanced TCP bypass
[12] GHOST Attack         - Vulnerability exploit
[13] KONTOL Method        - High intensity connection flood
[14] L4 TCP Flood         - Layer 4 packet flood
[15] HTTPW Method         - Web application flood
[16] BY-PASS Ultimate     - Combined bypass techniques

[VIP & TLS METHODS]
[17] TLS-HELLO Flood      - TLS handshake overwhelm
[18] VIP Method           - Proxy rotation attack
[19] TLS-Renegotiation    - TLS renegotiation exploit
[20] VIP-TLS Combo        - Combined VIP & TLS attack
`, 'output');

    // 4. Input Simulation
    await wait(1000);
    writeLine('[?] Select attack method (0-20): 20', 'input');
    await wait(500);
    writeLine('[+] Selected: VIP-TLS Combo', 'warning');
    
    await wait(500);
    writeLine(`[?] Enter target URL: http://${cleanTgt}`, 'input');
    
    await wait(500);
    writeLine('[?] Number of threads (1-2000): 1000', 'input');
    
    await wait(500);
    writeLine('[?] Attack duration in seconds: 60', 'input');
    
    await wait(500);
    writeLine('[?] Power level (1-100): 100', 'input');
    
    writeLine('============================================================', 'output');
    writeLine('⚠️  EXTREME WARNING: VIP/TLS METHOD SELECTED!', 'error');
    writeLine('⚠️  These methods are highly aggressive!', 'error');
    writeLine('⚠️  High risk of detection and legal action!', 'error');
    writeLine('============================================================', 'output');
    
    await wait(800);
    writeLine('[?] Confirm attack? (yes/no): yes', 'input');
    await wait(500);
    
    writeLine(`[+] Starting SUPER attack with 1000 threads...`, 'success');
    writeLine(`[+] Target: http://${cleanTgt}`, 'success');
    writeLine(`[+] Duration: 60 seconds`, 'success');
    writeLine(`[+] Method: VIP-TLS Combo`, 'success');
    writeLine(`[+] Power Level: 100/100`, 'success');
    writeLine('============================================================', 'output');
    
    await wait(1000);
    
    // 5. Attack Loop (Visual Flood)
    let packetCount = 0;
    let duration = 0;
    const colors: TerminalLine['type'][] = ['error', 'success', 'warning', 'system', 'output'];
    
    ddosIntervalRef.current = window.setInterval(() => {
        packetCount += 15; // Increment attack count visual
        duration += 100;
        
        // Randomly generate EXADOS style logs
        const threadId = Math.floor(Math.random() * 1000) + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random attack type for the "Combo" feel
        const attackTypes = [
            `VIP Method #${packetCount} | Status: 200 | Proxy: True`,
            `TLS HELLO Flood #${packetCount} | Handshakes: 500`,
            `VIP Method #${packetCount} | Connections: 10`,
            `VIP-TLS Combo #${packetCount} | Attacks: 2`
        ];
        const logMsg = attackTypes[Math.floor(Math.random() * attackTypes.length)];

        writeLine(`[Thread ${threadId}] ${logMsg}`, color);
        
        // Stats Line (Simulated by occasionally printing a system status)
        if (packetCount % 50 === 0) {
           const elapsed = Math.floor(duration / 1000);
           const rate = Math.floor(packetCount / (elapsed || 1));
           writeLine(`[*] Time: ${elapsed}s | Attacks: ${packetCount} | Rate: ${rate}/s`, 'system');
        }

    }, 60); // Very fast updates

    // Stop after 6 seconds of simulation
    await wait(6000);
    
    if (ddosIntervalRef.current) clearInterval(ddosIntervalRef.current);
    
    writeLine('[+] Attack duration completed. Stopping threads...', 'success');
    writeLine(`[+] SUPER Attack finished. Total requests: ${packetCount}`, 'success');
    writeLine(`[+] Attack power: ${(packetCount/6).toFixed(2)} requests/second`, 'success');
    writeLine('[+] VIP/TLS Methods used: Advanced encryption attacks', 'warning');
    writeLine('============================================================', 'warning');
    
    setIsAttacking(false);
  };

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* 1. Header Section */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">VULNERABILITY ASSESSMENT</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
              C-Force AI
            </span>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Passive, non-intrusive analysis of exposed security weaknesses.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Mode</span>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-950/30 px-3 py-1 rounded border border-emerald-900/50">
              <Shield size={14} /> ACTIVE · OFFENSIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Scan Controls & Findings */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8">
          
          {/* 2. Target Input & Control Cluster */}
          <div className="mb-8 max-w-5xl mx-auto w-full">
            <div className="p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 shadow-xl mb-4">
              <div className="flex items-center bg-[#0F1623] rounded-md p-1">
                <Search className="text-slate-500 ml-4" size={20} />
                <input 
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Enter target IP or Domain (e.g., 10.10.10.5)"
                  className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none font-oxanium text-lg placeholder:text-slate-600"
                  disabled={isScanning || isAttacking}
                />
                
                {/* Standard Scan Button */}
                <button 
                  onClick={() => startScan()}
                  disabled={isScanning || isAttacking || !target}
                  className={`px-6 py-3 rounded font-bold font-orbitron tracking-wider transition-all duration-300 flex items-center gap-2 mr-2
                    ${isScanning 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    }`}
                >
                  {isScanning ? (
                    <><Scan className="animate-spin" size={18} /> SCANNING</>
                  ) : (
                    <><ScanLine size={18} /> SCAN</>
                  )}
                </button>
              </div>
            </div>

            {/* Offensive Tools Toolbar */}
            <div className="flex justify-end gap-3">
               <button 
                  onClick={runMetasploit}
                  disabled={isScanning || isAttacking || !target}
                  className="px-4 py-2 bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 text-red-500 hover:text-white rounded text-xs font-bold font-orbitron uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Flame size={14} /> Auto-Pwn (MSF)
               </button>
               <button 
                  onClick={runBruteForce}
                  disabled={isScanning || isAttacking || !target}
                  className="px-4 py-2 bg-orange-950/40 border border-orange-900/50 hover:bg-orange-900/60 text-orange-500 hover:text-white rounded text-xs font-bold font-orbitron uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Unlock size={14} /> WPScan Attack
               </button>
               <button 
                  onClick={runSSHBruteForce}
                  disabled={isScanning || isAttacking || !target}
                  className="px-4 py-2 bg-purple-950/40 border border-purple-900/50 hover:bg-purple-900/60 text-purple-500 hover:text-white rounded text-xs font-bold font-orbitron uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Hash size={14} /> Brute Force (SSH)
               </button>
               <button 
                  onClick={runDDoS}
                  disabled={isScanning || isAttacking || !target}
                  className="px-4 py-2 bg-red-700 border border-red-500/50 hover:bg-red-600 text-white rounded text-xs font-bold font-orbitron uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(220,38,38,0.4)]"
               >
                  <Zap size={14} className="fill-white" /> Attack DDoS
               </button>
            </div>
            <div className="text-[10px] text-slate-500 text-right mt-1 mr-1 italic">
               * Use 'demo' or '10.x.x.x' in target for successful exploit simulation.
            </div>
          </div>

          {/* 3. Findings Panel */}
          <div className="max-w-5xl mx-auto w-full space-y-6 pb-20">
            {(findings.length > 0) && (
              <>
                 {CATEGORIES.map((cat) => {
                  const catFindings = findings.filter(f => f.category === cat.id);
                  if (catFindings.length === 0) return null;

                  return (
                    <div key={cat.id} className="border border-slate-800 bg-[#0F1623] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <button 
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border-b border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <cat.icon className="text-slate-400" size={20} />
                          <h3 className="font-bold text-slate-200 font-oxanium tracking-wide">{cat.label}</h3>
                          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">{catFindings.length}</span>
                        </div>
                        {expandedCats[cat.id] ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                      </button>
                      
                      {expandedCats[cat.id] && (
                        <div className="divide-y divide-slate-800/50">
                          {catFindings.map((vuln) => (
                            <div key={vuln.id} className="p-4 hover:bg-slate-800/30 transition-colors group relative border-l-4 border-transparent hover:border-l-4">
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                vuln.severity === 'CRITICAL' ? 'bg-red-500' : 
                                vuln.severity === 'HIGH' ? 'bg-orange-500' : 'bg-transparent'
                              }`}></div>
                              
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded-sm text-xs font-bold font-orbitron tracking-wider ${getSeverityBadge(vuln.severity)}`}>
                                    {vuln.severity}
                                  </span>
                                  <h4 className="text-lg font-bold text-slate-100">{vuln.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">CVSS</span>
                                  <div className={`px-2 py-1 rounded bg-slate-800 font-mono font-bold ${
                                    vuln.cvss >= 9.0 ? 'text-red-500' : 
                                    vuln.cvss >= 7.0 ? 'text-orange-500' : 'text-amber-500'
                                  }`}>
                                    {vuln.cvss}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-slate-400 text-sm mb-3 max-w-3xl leading-relaxed">
                                {vuln.description}
                              </p>
                              
                              <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
                                <span className="flex items-center gap-1.5">
                                  <Server size={12} /> {vuln.component}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Activity size={12} /> {vuln.method}
                                </span>
                                <span className="text-slate-600">ID: {vuln.id}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {findings.length === 0 && !isScanning && !isAttacking && (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                 <ShieldAlert size={64} className="mx-auto text-slate-700 mb-4" />
                 <h3 className="text-xl text-slate-500 font-orbitron">No Data</h3>
                 <p className="text-slate-600">Use the terminal commands or buttons above to start.</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. OFFENSIVE TERMINAL (Replaces Sidebar) */}
        <aside className="w-[500px] bg-[#05080F] border-l border-slate-800 flex flex-col z-20 shadow-2xl transition-all duration-300">
          
          {/* Terminal Header */}
          <div className="p-3 border-b border-slate-800 bg-[#080C14] flex items-center justify-between handle cursor-move">
            <div className="flex items-center gap-2">
               <Terminal size={14} className="text-emerald-500" />
               <span className="text-slate-300 font-bold font-mono text-xs tracking-wider">C-FORCE ROOT SHELL</span>
            </div>
            <div className="flex gap-2">
               <Minus size={12} className="text-slate-500 cursor-pointer hover:text-white" />
               <Maximize2 size={12} className="text-slate-500 cursor-pointer hover:text-white" />
               <X size={12} className="text-slate-500 cursor-pointer hover:text-red-500" />
            </div>
          </div>
          
          {/* Terminal Body */}
          <div 
             className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-black text-slate-300 custom-scrollbar relative"
             onClick={() => inputRef.current?.focus()}
          >
             {/* Scanlines Effect */}
             <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10"></div>

             {terminalHistory.map((line) => (
              <div key={line.id} className="mb-1 break-words leading-relaxed relative z-0 whitespace-pre-wrap">
                {line.type === 'input' && (
                   <span className="text-white font-bold">{line.text}</span>
                )}
                {line.type === 'system' && (
                   <span className="text-blue-400 font-bold">{line.text}</span>
                )}
                {line.type === 'error' && (
                   <span className="text-red-500 font-bold">{line.text}</span>
                )}
                {line.type === 'warning' && (
                   <span className="text-amber-500">{line.text}</span>
                )}
                {line.type === 'success' && (
                   <span className="text-emerald-500 font-bold">{line.text}</span>
                )}
                {line.type === 'output' && (
                   <span className="text-slate-400">{line.text}</span>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Input */}
          <div className="p-3 bg-[#0a0a0a] border-t border-slate-800 flex items-center gap-2">
             <span className={`font-mono text-xs font-bold whitespace-nowrap ${
                termContext === 'ROOT' ? 'text-red-500' : 
                termContext === 'METERPRETER' ? 'text-blue-500' : 'text-emerald-500'
             }`}>
                {getPromptLabel()}
             </span>
             <input 
               ref={inputRef}
               type="text" 
               value={cmdInput}
               onChange={(e) => setCmdInput(e.target.value)}
               onKeyDown={handleKeyDown}
               className="flex-1 bg-transparent border-none focus:outline-none text-white font-mono text-xs"
               autoComplete="off"
               spellCheck="false"
               disabled={isAttacking || isScanning}
             />
          </div>

          {/* Attack Status Footer */}
          {(isAttacking || isScanning) && (
             <div className="bg-emerald-950/20 border-t border-emerald-900/50 p-1">
                <div className="h-1 bg-emerald-500/20 w-full overflow-hidden relative">
                   <div className="absolute top-0 left-0 h-full w-1/3 bg-emerald-500 animate-slide-scan"></div>
                </div>
                <div className="text-[9px] text-emerald-500 text-center font-mono mt-1 uppercase">
                   {isAttacking ? 'EXPLOIT SEQUENCE ACTIVE' : 'VULNERABILITY SCANNING...'}
                </div>
             </div>
          )}

        </aside>

      </div>
    </div>
  );
};
