import { toast } from "react-hot-toast";

export function demoActionGuard(isDemo: boolean, action: () => void) {
  if (isDemo) {
    toast('Changes are reset every 24h in demo mode', { 
      icon: '👀',
      style: {
        borderRadius: '16px',
        background: '#18181b',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    });
    return;
  }
  action();
}
