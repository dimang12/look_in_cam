import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: '[app-submenu]',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.css']
})
export class SubmenuComponent {
  @Input() visible = true;
  @Input() menu: any = null; // expected shape: { label: string, children: Array<{ route, icon, label }> }
  @Output() itemClicked = new EventEmitter<any>();
  // Ensure host element receives the submenu class so we don't need an extra wrapper
  @HostBinding('class.submenu-navigation') hostClass = true;

  onItemClick(child: any) {
    this.itemClicked.emit(child);
  }
}
