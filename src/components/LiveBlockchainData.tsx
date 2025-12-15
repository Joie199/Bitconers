'use client';

import { useState, useEffect, useRef } from 'react';

// Mempool block (unconfirmed) interface
interface MempoolBlock {
  blockSize: number;
  nTx: number;
  totalFees: number;
  medianFee: number;
  minFee: number;
  maxFee: number;
  feeRange: number[];
  virtualSize: number;
}

// Confirmed block interface
interface ConfirmedBlock {
  height: number;
  id: string;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  pool?: {
    id: string;
    name: string;
    slug: string;
  };
  extras?: {
    feeRange: number[];
    avgFee: number;
    totalFees: number;
  };
  fee?: number;
  fees?: number;
}

interface LiveBlockchainDataProps {
  className?: string;
}

// Helper function to format time ago (matching mempool.space format)
function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff} seconds ago`;
  
  const minutesAgo = Math.floor(diff / 60);
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
  
  const hoursAgo = Math.floor(diff / 3600);
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;
  
  const daysAgo = Math.floor(diff / 86400);
  return `${daysAgo} days ago`;
}

// Helper function to format BTC (with 3 decimal places)
function formatBTC(sats: number): string {
  const btc = sats / 1e8;
  return btc.toFixed(3);
}

// Helper function to format fee range
function formatFeeRange(minFee: number, maxFee: number): string {
  if (minFee === maxFee) {
    return `${minFee.toFixed(2)} sat/vB`;
  }
  return `${minFee.toFixed(2)} - ${maxFee.toFixed(1)} sat/vB`;
}

export function LiveBlockchainData({ className = '' }: LiveBlockchainDataProps) {
  const [mempoolBlocks, setMempoolBlocks] = useState<MempoolBlock[]>([]);
  const [confirmedBlocks, setConfirmedBlocks] = useState<ConfirmedBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastBlockHeightRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const fetchBlockData = async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        }
        setError(null);

        // Fetch both endpoints in parallel
        const [mempoolResponse, blocksResponse] = await Promise.all([
          fetch('https://mempool.space/api/v1/fees/mempool-blocks'),
          fetch('https://mempool.space/api/blocks'),
        ]);

        if (!mempoolResponse.ok || !blocksResponse.ok) {
          throw new Error('Failed to fetch blockchain data');
        }

        const mempoolData: MempoolBlock[] = await mempoolResponse.json();
        const blocksData: ConfirmedBlock[] = await blocksResponse.json();

        if (!isMounted) return;

        // Check if a new block was mined
        const currentBlockHeight = blocksData[0]?.height;
        const hasNewBlock = lastBlockHeightRef.current !== null && 
                           currentBlockHeight !== null && 
                           currentBlockHeight > lastBlockHeightRef.current;
        
        if (currentBlockHeight !== null) {
          lastBlockHeightRef.current = currentBlockHeight;
        }

        // Fetch detailed block info including pool data for each block
        const blocksWithPoolData = await Promise.all(
          blocksData.slice(0, 4).map(async (block) => {
            try {
              const blockDetailResponse = await fetch(`https://mempool.space/api/block/${block.id}`);
              if (blockDetailResponse.ok) {
                const blockDetail = await blockDetailResponse.json();
                return {
                  ...block,
                  pool: blockDetail.pool || block.pool,
                  extras: blockDetail.extras || block.extras || {
                    feeRange: blockDetail.feeRange || [],
                    avgFee: blockDetail.avgFee || block.fee || 0,
                    totalFees: blockDetail.fees || block.fees || 0,
                  },
                };
              }
            } catch (err) {
              console.error('Error fetching block detail:', err);
            }
            return block;
          })
        );

        // Take first 4 mempool blocks and first 4 confirmed blocks
        setMempoolBlocks(mempoolData.slice(0, 4));
        setConfirmedBlocks(blocksWithPoolData);

        if (isInitial) {
          setLoading(false);
        }

        // If new block detected, briefly show a visual indicator (optional)
        if (hasNewBlock) {
          console.log('New block detected!', currentBlockHeight);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load blockchain data');
        console.error('Error fetching blockchain data:', err);
        if (isInitial) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchBlockData(true);

    // Refresh every 15 seconds
    pollInterval = setInterval(() => {
      fetchBlockData(false);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className={`rounded-lg border border-orange-400/30 bg-orange-500/10 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent"></div>
          <p className="text-orange-200">Loading live blockchain data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-400/30 bg-red-500/10 p-6 ${className}`}>
        <p className="text-red-200">Error: {error}</p>
        <p className="text-sm text-red-300 mt-2">Unable to load live blockchain data</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Headers */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h5 className="text-base font-semibold text-green-300">Mempool (Unconfirmed)</h5>
        <h5 className="text-base font-semibold text-blue-300">Recently Mined</h5>
      </div>

      {/* Horizontal Blocks Layout */}
      <div className="relative flex items-start gap-4 overflow-x-auto pb-4 px-2">
        {/* MEMPOOL BLOCKS (Left Side - Unconfirmed) */}
        <div className="flex gap-4 flex-shrink-0">
          {mempoolBlocks.map((block, index) => {
            const etaMinutes = (index + 1) * 10;
            // Extract and format fee data from mempool block
            // feeRange is an array: [min, ..., max]
            const feeRange = block.feeRange || [];
            const medianFee = Number(block.medianFee ?? 0).toFixed(0);
            const minFee = feeRange.length > 0 
              ? Number(feeRange[0]).toFixed(2) 
              : '0.00';
            const maxFee = feeRange.length > 0 
              ? Number(feeRange[feeRange.length - 1]).toFixed(2) 
              : '0.00';
            
            return (
              <div key={index} className="relative flex-shrink-0 flex flex-col" style={{ width: '200px' }}>
                {/* 3D Cube Effect - Mempool Block */}
                <div
                  className="relative"
                  style={{
                    transform: 'perspective(500px) rotateX(5deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Front face (green to yellow gradient) */}
                  <div 
                    className="border p-5 h-[200px] flex flex-col justify-between relative z-10"
                    style={{
                      background: 'linear-gradient(to bottom, #25c648, #697b00)',
                      borderRadius: '6px',
                      borderColor: 'rgba(74, 222, 128, 0.4)',
                      boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    <div className="space-y-2">
                      {/* Top: Median Fee (big + bold) */}
                      <p className="text-sm text-white font-bold leading-tight">
                        ~{medianFee} sat/vB
                      </p>
                      {/* Fee range (small) */}
                      <p className="text-xs leading-tight" style={{ color: 'rgba(187, 247, 208, 0.95)' }}>
                        {minFee} – {maxFee} sat/vB
                      </p>
                      {/* Fee range bar with glow */}
                      <div 
                        className="mt-1"
                        style={{
                          height: '2px',
                          width: '80%',
                          background: 'rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)',
                        }}
                      />
                      {/* Large BTC value */}
                      <p 
                        className="font-bold leading-tight mt-3" 
                        style={{ 
                          color: 'rgba(187, 247, 208, 1)',
                          fontSize: '24px',
                          fontWeight: 600,
                          textShadow: '0 0 6px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {formatBTC(block.totalFees)} BTC
                      </p>
                    </div>
                    <div className="space-y-2 mt-auto">
                      {/* Transaction count */}
                      <p className="text-xs text-white/90 leading-tight">
                        {block.nTx.toLocaleString()} transactions
                      </p>
                      {/* ETA */}
                      <p className="text-xs text-white/80 italic leading-tight">
                        In ~{etaMinutes} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider Line with Arrows */}
        <div className="relative flex-shrink-0 flex flex-col items-center mx-3" style={{ height: '240px' }}>
          {/* Top Arrow */}
          <div className="text-white/50 text-xs mb-1" style={{ fontSize: '10px' }}>↑</div>
          
          {/* Dotted Line */}
          <div 
            className="flex-1"
            style={{
              width: '2px',
              borderLeft: '2px dotted rgba(255, 255, 255, 0.2)',
            }}
          />
          
          {/* Bottom Arrow */}
          <div className="text-white/50 text-xs mt-1" style={{ fontSize: '10px' }}>↓</div>
        </div>

        {/* CONFIRMED BLOCKS (Right Side) */}
        <div className="flex gap-4 flex-shrink-0">
          {confirmedBlocks.map((block, index) => {
            // Extract and format fee data from confirmed block
            const feeRange = block.extras?.feeRange || [];
            // feeRange format: [min, median, max] or [min, max]
            const medianFee = feeRange.length >= 3 
              ? Number(feeRange[1]).toFixed(0)
              : (block.extras?.avgFee ? Number(block.extras.avgFee).toFixed(0) : '0');
            const minFee = feeRange.length > 0 
              ? Number(feeRange[0]).toFixed(2)
              : (block.extras?.avgFee ? Number(block.extras.avgFee).toFixed(2) : '0.00');
            const maxFee = feeRange.length >= 3
              ? Number(feeRange[2]).toFixed(2)
              : (feeRange.length === 2 
                  ? Number(feeRange[1]).toFixed(2)
                  : (block.extras?.avgFee ? Number(block.extras.avgFee).toFixed(2) : '0.00'));
            const timeAgo = getTimeAgo(block.timestamp);
            
            return (
              <div key={block.id} className="relative flex-shrink-0 flex flex-col" style={{ width: '200px' }}>
                {/* Block height above */}
                <p className="text-xs font-bold mb-2 ml-1 h-6 flex items-center" style={{ color: '#4cb3ff' }}>
                  {block.height}
                </p>
                
                {/* 3D Cube Effect - Confirmed Block */}
                <div
                  className="relative"
                  style={{
                    transform: 'perspective(500px) rotateX(5deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Front face (blue to purple gradient) */}
                  <div 
                    className="border p-5 h-[200px] flex flex-col justify-between relative z-10"
                    style={{
                      background: 'linear-gradient(to bottom, #3d4ccf, #7527b7)',
                      borderRadius: '6px',
                      borderColor: 'rgba(96, 165, 250, 0.4)',
                      boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    <div className="space-y-2">
                      {/* Top: Median Fee (big + bold) */}
                      <p className="text-sm text-white font-bold leading-tight">
                        ~{medianFee} sat/vB
                      </p>
                      {/* Fee range (small) */}
                      <p className="text-xs leading-tight" style={{ color: 'rgba(165, 243, 252, 0.95)' }}>
                        {minFee} – {maxFee} sat/vB
                      </p>
                      {/* Fee range bar with glow */}
                      <div 
                        className="mt-1"
                        style={{
                          height: '2px',
                          width: '80%',
                          background: 'rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)',
                        }}
                      />
                      {/* Large BTC value */}
                      <p 
                        className="font-bold leading-tight mt-3" 
                        style={{ 
                          color: 'rgba(191, 219, 254, 1)',
                          fontSize: '24px',
                          fontWeight: 600,
                          textShadow: '0 0 6px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {formatBTC(block.extras?.totalFees || block.fees || 0)} BTC
                      </p>
                    </div>
                    <div className="space-y-2 mt-auto">
                      {/* Transaction count */}
                      <p className="text-xs text-white/90 leading-tight">
                        {block.tx_count.toLocaleString()} transactions
                      </p>
                      {/* Time ago */}
                      <p className="text-xs text-white/80 italic leading-tight">
                        {timeAgo}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Miner name below */}
                <div className="h-6 flex items-center mt-2 ml-1">
                  {block.pool?.name ? (
                    <p className="text-xs text-white/80 font-medium">
                      {block.pool.name}
                    </p>
                  ) : (
                    <p className="text-xs text-white/50 italic">Unknown</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-orange-400/70 italic text-center mt-6">
        Data from mempool.space • Updates every 15 seconds
      </p>
    </div>
  );
}
