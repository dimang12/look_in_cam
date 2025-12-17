import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ui-button',
  templateUrl: './button.component.html',
  // no styleUrls: rely on Tailwind utility classes only
})
export class ButtonComponent {
  @Input() type: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;
  // HTML button type to support forms
  @Input() htmlType: 'button' | 'submit' | 'reset' = 'button';
  // optional aria-label to forward to the native button
  @Input() ariaLabel: string | null = null;
  // extra Tailwind classes to append
  @Input() extraClasses: string = '';
  // accent overrides the color system — choose one of Tailwind color names (without shade)
  @Input() accent: 'purple' | 'blue'|'green'|'indigo'|'purple'|'teal'|'amber'|null = null;
  @Output() clicked = new EventEmitter<Event>();

  onClick(e: Event) {
    if (this.disabled) return;
    this.clicked.emit(e);
  }

  // Map inputs to Tailwind CSS classes
  get classes(): string {
    const sizeMap: Record<string,string> = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const typeMap: Record<string,string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-gray-800 hover:bg-gray-100 focus:ring-gray-200'
    };

    // If accent is provided, build a color class dynamically (Tailwind configured to scan templates)
    let typeClasses = typeMap[this.type];
    if (this.accent) {
      // use 600/700 shades for background, 500 for ring
      typeClasses = `bg-${this.accent}-600 text-white hover:bg-${this.accent}-700 focus:ring-${this.accent}-500`;
    }

    const base = 'inline-flex items-center justify-center rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
    const width = this.fullWidth ? 'w-full' : 'inline-block';
    const disabled = this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    // include any extra classes provided by consumer
    const extras = this.extraClasses ? this.extraClasses : '';

    // Compose and normalize whitespace
    return [base, sizeMap[this.size], typeClasses, width, disabled, extras].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }
}
