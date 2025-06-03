import React from 'react';

export default function MaskedMSISDN({ msisdn }: { msisdn: string }) {
  if (msisdn.length < 7) return <>{msisdn}</>;
  const first3 = msisdn.slice(0, 3);
  const last3 = msisdn.slice(msisdn.length - 3);
  const masked = `${first3}***${last3}`;
  return <>{masked}</>;
}
 
