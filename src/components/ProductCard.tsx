import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { ProductCardData } from '../types.ts';
import { trackClientEvent } from '../utils/analyticsClient.ts';

interface ProductCardProps {
  product: ProductCardData;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(product.imageUrl) && !imgError;
  const isAvailable = product.inStock !== false;

  const isPerfume = product.category === 'عطور' || 
    product.name.includes('عطر') || 
    Boolean(product.capacity) || 
    Boolean(product.inspiredBy);

  // Determine target link and button label based on hierarchical navigation
  const targetUrl = product.hasDirectPage !== false 
    ? product.productUrl 
    : (product.nearestOfficialUrl || product.productUrl);

  const isValidUrl = Boolean(
    targetUrl &&
    targetUrl.trim() !== '' &&
    targetUrl !== 'https://medhaloud.com' &&
    targetUrl !== 'https://medhaloud.com/' &&
    !targetUrl.endsWith('medhaloud.com') &&
    !targetUrl.endsWith('medhaloud.com/')
  );

  const buttonLabel = product.linkLabel || (
    product.linkType === 'offer'
      ? 'عرض العرض'
      : product.hasDirectPage === false
        ? (product.nearestOfficialLabel ? `تصفح ${product.nearestOfficialLabel}` : 'تصفح القسم')
        : 'عرض المنتج'
  );

  const linkTooltip = product.hasDirectPage === false
    ? `رابط ${product.nearestOfficialLabel || 'القسم الأقرب'} (لا توجد صفحة مستقلة للمنتج حالياً)`
    : product.linkType === 'offer'
      ? 'فتح صفحة العرض المحددة في متجر مدهال الطيب'
      : 'فتح صفحة المنتج الرسمية في متجر مدهال الطيب';

  return (
    <div
      onClick={() => trackClientEvent('product_click', { productName: product.name })}
      className="rounded-xl bg-[#1b1612] border border-[#35291e] hover:border-[#c99738]/50 transition duration-200 overflow-hidden shadow-md flex flex-col text-right cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative w-full h-36 bg-[#13100d] overflow-hidden flex items-center justify-center border-b border-[#2d2218]">
        {hasImage ? (
          <img
            src={product.imageUrl!}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#7a6a57] gap-1.5 p-4">
            <div className="w-10 h-10 rounded-lg bg-[#181410] border border-[#382b1d] p-1 flex items-center justify-center">
              <img src="/icon.png" alt="مدهال الطيب" className="w-full h-full object-contain opacity-70" />
            </div>
            <span className="text-[11px] text-[#8c7a65]">مدهال الطيب</span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-medium backdrop-blur-xs">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>متوفر</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-700/60 text-rose-300 text-[10px] font-medium backdrop-blur-xs">
              <XCircle className="w-2.5 h-2.5" />
              <span>نفدت الكمية</span>
            </span>
          )}
        </div>

        {/* Category Tag */}
        {product.category && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 rounded-md bg-[#181410]/90 border border-[#443424] text-[#d4af37] text-[10px] font-medium">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-[#f5ebd9] leading-snug line-clamp-2 break-words">
            {product.name}
          </h4>

          {/* Perfume specific specs or standard variants */}
          {isPerfume ? (
            <div className="space-y-1 mt-1.5 leading-normal">
              <div className="text-[11px] text-[#c4b097] font-medium flex items-center gap-1 flex-wrap">
                <span>السعة:</span>
                <span className="text-[#ecd7b6] font-semibold">{product.capacity || '100 مل'}</span>
              </div>
              {product.inspiredBy && (
                <div className="text-[11px] text-[#c99738] font-medium flex items-center gap-1 flex-wrap">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>مستوحى من:</span>
                  <span className="text-[#ffd983] break-words">{product.inspiredBy}</span>
                </div>
              )}
              {product.fragranceProfile && (
                <div className="text-[10px] text-[#a89886] break-words">
                  <span>الطابع العطري: </span>
                  <span className="text-[#c7b9a7]">{product.fragranceProfile}</span>
                </div>
              )}
            </div>
          ) : (
            product.variant && (
              <div className="text-[11px] text-[#c4b097] mt-1 font-medium break-words">
                الخيار / المقاس: <span className="text-[#ecd7b6]">{product.variant}</span>
              </div>
            )
          )}

          {product.description && (
            <p className="text-[11px] text-[#9c8c79] leading-relaxed mt-1.5 line-clamp-2 break-words">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-[#292017] flex items-center justify-between gap-1.5 min-w-0">
          <div className="text-right shrink-0">
            <span className="text-[10px] text-[#80705f] block leading-none">السعر الرسمي</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#e8c374] leading-tight block">
              {product.priceDisplay || (product.price ? `${product.price} ريال` : 'حسب الخيار')}
            </span>
          </div>

          {/* Real Verified Link (Direct Product/Offer or Closest Official Section) */}
          {isValidUrl && (
            <a
              href={targetUrl!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackClientEvent('product_link_click', { productName: product.name, url: targetUrl });
              }}
              className={`inline-flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-medium transition shrink-0 max-w-[130px] sm:max-w-[160px] ${
                product.hasDirectPage === false
                  ? 'bg-[#221c16] hover:bg-[#2e241b] border-[#403324] hover:border-[#c99738]/70 text-[#ddcaa8] hover:text-[#ffd983]'
                  : product.linkType === 'offer'
                    ? 'bg-[#2d2214] hover:bg-[#3d2f1b] border-[#5a4325] hover:border-[#e8c374] text-[#ffd983]'
                    : 'bg-[#271f17] hover:bg-[#382b1d] border-[#453423] hover:border-[#c99738] text-[#f0dfc8] hover:text-[#ffd983]'
              }`}
              title={linkTooltip}
            >
              <span className="truncate">{buttonLabel}</span>
              <ExternalLink className="w-3 h-3 text-[#c99738] shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
