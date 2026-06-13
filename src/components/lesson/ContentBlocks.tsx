export function TextBlock({ content, heading }: { content: string; heading?: string }) {
  return (
    <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {heading && <h3 className="text-xl font-bold mb-3">{heading}</h3>}
      <div className="prose prose-slate max-w-none text-foreground/80 leading-relaxed">
        {content.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export function KeyPointBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h4 className="font-bold text-primary uppercase tracking-wider text-sm">{title}</h4>
      </div>
      <p className="text-foreground font-medium leading-relaxed">{content}</p>
    </div>
  );
}

export function ImageBlock({ storageUrl, caption }: { storageUrl: string; caption: string }) {
  return (
    <div className="mb-8 animate-in fade-in duration-700">
      <div className="bg-muted rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative border">
        <img src={storageUrl} alt={caption} className="object-contain max-h-full" />
      </div>
      {caption && (
        <p className="mt-3 text-sm text-center text-muted-foreground italic font-medium">
          {caption}
        </p>
      )}
    </div>
  );
}
