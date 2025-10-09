import React, { useState } from 'react';
import { Transaction } from '../App';
import { normalize, resolveMerchantLogo, resolveMerchantDomain } from '../services/merchantLogos';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return grouped;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const isIncome = (t: Transaction) => t.type === '+' || t.amount < 0 === false && t.type === '+'; // conservative

  const isPresent = (value?: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return trimmed.toUpperCase() !== 'N/A';
  };

  const groupedTransactions = groupTransactionsByDate();

  const [debugLogos, setDebugLogos] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('txnDebugLogos');
      return saved === '1';
    } catch {
      return false;
    }
  });

  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [triedIconHorse, setTriedIconHorse] = useState<Set<string>>(new Set());
  const [triedGoogleFavicon, setTriedGoogleFavicon] = useState<Set<string>>(new Set());

  const getDisplayName = (t: Transaction) => {
    const source = (t.text && t.text !== 'N/A' ? t.text : t.description) || '';
    // Prefer part before dash, else first word
    const dashed = source.split(' - ')[0];
    const word = dashed.split(' ')[0];
    return dashed || word || '•';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  // Coalesce paired transfer rows ("Transfer from X" + "Transfer to Y" at same time) -> one row "Transfer X -> Y"
  const coalesceTransferPairs = (items: Transaction[]): Transaction[] => {
    const result: Transaction[] = [];
    const used = new Set<number>();
    for (let i = 0; i < items.length; i++) {
      if (used.has(i)) continue;
      const a = items[i];
      const fromMatch = /^Transfer from\s+(.+)$/i.exec(a.description);
      const toMatch = /^Transfer to\s+(.+)$/i.exec(a.description);

      // Try to find a pair at the same time with opposite sign and same absolute amount
      let pairedIndex = -1;
      for (let j = i + 1; j < items.length; j++) {
        if (used.has(j)) continue;
        const b = items[j];
        if (a.time === b.time && Math.abs(a.amount - b.amount) < 0.001 && (a.type === '+' ? b.type !== '+' : b.type === '+')) {
          const bFrom = /^Transfer from\s+(.+)$/i.exec(b.description);
          const bTo = /^Transfer to\s+(.+)$/i.exec(b.description);
          if ((fromMatch && bTo) || (toMatch && bFrom)) {
            pairedIndex = j;
            break;
          }
        }
      }

      if (pairedIndex >= 0) {
        const b = items[pairedIndex];
        const fromName = (fromMatch ? fromMatch[1] : (/^Transfer from\s+(.+)$/i.exec(b.description)?.[1])) || '';
        const toName = (toMatch ? toMatch[1] : (/^Transfer to\s+(.+)$/i.exec(b.description)?.[1])) || '';
        const amount = a.amount; // same as b.amount
        const merged: Transaction = {
          id: `${a.id || i}_x_${b.id || pairedIndex}`,
          description: 'Transfer',
          amount,
          type: '',
          status: 'SETTLED',
          date: a.date,
          time: a.time,
          text: `${fromName} → ${toName}`,
          message: '',
          roundup: 'false',
          tags: Array.from(new Set([...(a.tags || []), ...(b.tags || []), 'internal'])),
          merchantLogoUrl: undefined,
        };
        result.push(merged);
        used.add(i);
        used.add(pairedIndex);
      } else {
        result.push(a);
      }
    }
    return result;
  };

  return (
    <div className={`card txn-contrast`}>
      <div className="card-header d-flex align-items-center justify-content-between">
        <h3 className="mb-0">💳 Recent Transactions</h3>
      </div>
      <div className="card-body">
        {Object.keys(groupedTransactions).length === 0 ? (
          <p className="text-muted text-center">No transactions found</p>
        ) : (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
            const coalesced = coalesceTransferPairs(dayTransactions);
            return (
            <div key={date} className="mb-4">
              <div className="txn-date-divider">
                <span>{formatDate(date)}</span>
              </div>
              
              {coalesced.map((transaction, index) => {
                const resolvedUrl = transaction.merchantLogoUrl || resolveMerchantLogo(transaction.description, transaction.text);
                const resolvedDomain = resolveMerchantDomain(transaction.description, transaction.text);
                const faviconUrl = resolvedDomain ? `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=64` : undefined;
                return (
                <div key={transaction.id || index} className="txn-row d-flex align-items-center justify-content-between">
                  <div className={`txn-avatar me-3 ${/^(Transfer)$/i.test(transaction.description) ? 'txn-avatar-transfer' : ''}`}>
                    {resolvedUrl && !failedLogos.has(transaction.id) ? (
                      <img
                        src={resolvedUrl.replace('logo.clearbit.com/', 'logo.clearbit.com/').replace(/(\?|$)/, (m) => m === '?' ? '?size=256&' : '?size=256')}
                        alt=""
                        className="txn-logo"
                        width={36}
                        height={36}
                        title={resolvedUrl}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          // 1) Try IconHorse
                          if (!triedIconHorse.has(transaction.id)) {
                            try {
                              const domain = resolvedDomain || new URL(resolvedUrl!).hostname;
                              const iconHorse = `https://icon.horse/icon/${domain}`;
                              img.src = iconHorse;
                              setTriedIconHorse(prev => new Set(prev).add(transaction.id));
                              if (debugLogos) {
                                // eslint-disable-next-line no-console
                                console.warn('Logo 404, switching to IconHorse:', { id: transaction.id, resolvedUrl, iconHorse });
                              }
                              return;
                            } catch {}
                          }
                          // 2) Try Google favicon
                          if (!triedGoogleFavicon.has(transaction.id)) {
                            try {
                              const domain = resolvedDomain || new URL(resolvedUrl!).hostname;
                              const googleFav = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                              img.src = googleFav;
                              setTriedGoogleFavicon(prev => new Set(prev).add(transaction.id));
                              if (debugLogos) {
                                // eslint-disable-next-line no-console
                                console.warn('IconHorse failed, switching to Google favicon:', { id: transaction.id, googleFav });
                              }
                              return;
                            } catch {}
                          }
                          // 3) Give up → initials
                          if (debugLogos) {
                            // eslint-disable-next-line no-console
                            console.error('All logo fallbacks failed, showing initials:', { id: transaction.id });
                          }
                          setFailedLogos(prev => new Set(prev).add(transaction.id));
                        }}
                        onLoad={() => {
                          if (debugLogos) {
                            // eslint-disable-next-line no-console
                            console.log('Logo loaded:', { id: transaction.id, src: resolvedUrl });
                          }
                        }}
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
                        <span className={`badge ${transaction.status === 'SETTLED' ? 'bg-success' : 'bg-warning'} small`}>{transaction.status}</span>
                      )}
                      {isPresent(transaction.time) && (
                        <span className="text-muted small">{transaction.time}</span>
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
              );})}
            </div>
          );})
        )}
      </div>
    </div>
  );
};

export default TransactionList;
