/**
 * Component skeleton loading dùng chung.
 * Hiển thị placeholder khi đang tải dữ liệu.
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'skeleton rounded animate-pulse';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/** Skeleton cho thẻ poster phim */
export function MovieCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-theme-sm animate-pulse">
      <Skeleton variant="rectangular" className="w-full aspect-[2/3]" />
      <div className="p-3 space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
        <Skeleton className="w-1/3 h-4" />
      </div>
    </div>
  );
}

/** Skeleton cho hàng bảng */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  );
}
