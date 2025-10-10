import React, { useRef } from 'react';
import { Transaction } from '../../App';
import { resolveMerchantLogo, resolveMerchantDomain } from '../../services/merchantLogos';

interface TransactionRowProps {
  transaction: Transaction;
  debugLogos: boolean;
  index: number;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, debugLogos, index }) => {
  const failedLogos = useRef<Set<string>>(new Set());
  const triedIconHorse = useRef<Set<string>>(new Set());
  const triedGoogleFavicon = useRef<Set<string>>(new Set());

  const getDisplayName = (t: Transaction) => {
    const source = (t.text && t.text !== 'N/A' ? t.text : t.description) || '';
    const dashed = source.split(' - ')[0];
    const word = dashed.split(' ')[0];
    return dashed || word || '•';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  const isPresent = (value?: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return trimmed.toUpperCase() !== 'N/A';
  };

  const resolvedUrl = transaction.merchantLogoUrl || resolveMerchantLogo(transaction.description, transaction.text);
  const resolvedDomain = resolveMerchantDomain(transaction.description, transaction.text);
  const faviconUrl = resolvedDomain ? `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=64` : undefined;

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement;
    
    // 1) Try IconHorse
    if (!triedIconHorse.current.has(transaction.id)) {
      try {
        const domain = resolvedDomain || new URL(resolvedUrl!).hostname;
        const iconHorse = `https://icon.horse/icon/${domain}`;
        img.src = iconHorse;
        triedIconHorse.current.add(transaction.id);
        if (debugLogos) {
          console.warn('Logo 404, switching to IconHorse:', { id: transaction.id, resolvedUrl, iconHorse });
        }
        return;
      } catch {}
    }
    
    // 2) Try Google favicon
    if (!triedGoogleFavicon.current.has(transaction.id)) {
      try {
        const domain = resolvedDomain || new URL(resolvedUrl!).hostname;
        const googleFav = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        img.src = googleFav;
        triedGoogleFavicon.current.add(transaction.id);
        if (debugLogos) {
          console.warn('IconHorse failed, switching to Google favicon:', { id: transaction.id, googleFav });
        }
        return;
      } catch {}
    }
    
    // 3) Give up → initials
    if (debugLogos) {
      console.error('All logo fallbacks failed, showing initials:', { id: transaction.id });
    }
    failedLogos.current.add(transaction.id);
  };

  const handleLogoLoad = () => {
    if (debugLogos) {
      console.log('Logo loaded:', { id: transaction.id, src: resolvedUrl });
    }
  };

  return (
    <div className="txn-row d-flex align-items-center justify-content-between">
      <div className={`txn-avatar me-3 ${/^(Transfer)$/i.test(transaction.description) ? 'txn-avatar-transfer' : ''}`}>
        {resolvedUrl && !failedLogos.current.has(transaction.id) ? (
          <img
            src={resolvedUrl.replace('logo.clearbit.com/', 'logo.clearbit.com/').replace(/(\?|$)/, (m) => m === '?' ? '?size=256&' : '?size=256')}
            alt=""
            className="txn-logo"
            width={36}
            height={36}
            title={resolvedUrl}
            onError={handleLogoError}
            onLoad={handleLogoLoad}
          />
        ) : (
          /^(Transfer)$/i.test(transaction.description)
            ? <div className="txn-initials" title="Transfer">🔁</div>
            : <div className="txn-initials">{getInitials(getDisplayName(transaction))}</div>
        )}
      </div>
      
      <div className="d-flex flex-column flex-grow-1 me-3">
        <div className="d-flex align-items-center">
          <span className="txn-description me-2">
            {/^(Transfer)$/i.test(transaction.description) ? 'Transfer' : transaction.description}
          </span>
          {isPresent(transaction.text) && (
            <span className="txn-merchant text-muted small">{transaction.text}</span>
          )}
        </div>
        
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {isPresent(transaction.status) && (
            <span className={`badge ${transaction.status === 'SETTLED' ? 'bg-success' : 'bg-warning'} small`}>
              {transaction.status}
            </span>
          )}
          {isPresent(transaction.time) && (
            <span className="text-muted small">{transaction.time}</span>
          )}
          {transaction.accountName && (
            <span className="badge bg-secondary small">🏦 {transaction.accountName}</span>
          )}
          {isPresent(transaction.message) && (
            <span className="text-muted small">• {transaction.message}</span>
          )}
          {transaction.roundup === 'true' && (
            <span className="text-info small">• Round Up</span>
          )}
          {Array.isArray(transaction.tags) && transaction.tags.length > 0 && (
            <span className="txn-tags d-flex align-items-center gap-1 flex-wrap">
              {transaction.tags.map((tag, i) => {
                const label = tag === 'internal' ? 'TRANSFER' : tag.toUpperCase();
                return (
                  <span key={i} className="badge bg-secondary text-uppercase small">{label}</span>
                );
              })}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-end">
        <span className={`txn-amount ${transaction.type === '+' ? 'text-success' : 'text-white'}`}>
          {transaction.type === '+' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
        </span>
        {debugLogos && (
          <div className="txn-debug text-muted small mt-1">
            {resolvedDomain ? `domain: ${resolvedDomain}` : 'domain: (none)'}
            {resolvedUrl ? ` | logo: ${resolvedUrl}` : ''}
            {faviconUrl ? ` | favicon: ${faviconUrl}` : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionRow;
