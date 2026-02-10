
import React from 'react';
import { GeneratedAsset } from '../types';

interface AssetCardProps {
  asset: GeneratedAsset;
  onAnimate?: (asset: GeneratedAsset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onAnimate }) => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col group transition-all hover:scale-[1.02]">
      <div className="relative aspect-square overflow-hidden bg-black/40">
        {asset.type === 'image' ? (
          <img src={asset.url} alt={asset.prompt} className="w-full h-full object-contain" />
        ) : (
          <video src={asset.url} controls className="w-full h-full object-contain" />
        )}
        
        {asset.type === 'image' && onAnimate && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => onAnimate(asset)}
              className="bg-white text-black px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-200"
            >
              <i className="fas fa-play"></i> Animovat s Veo
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-400 line-clamp-2 italic">"{asset.prompt}"</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs font-mono text-gray-500 uppercase">{asset.type === 'image' ? 'Obrázek' : 'Video'}</span>
          <a 
            href={asset.url} 
            download={`prenas-${asset.id}.${asset.type === 'image' ? 'png' : 'mp4'}`}
            className="text-gray-400 hover:text-white transition-colors"
            title="Stáhnout"
          >
            <i className="fas fa-download"></i>
          </a>
        </div>
      </div>
    </div>
  );
};
