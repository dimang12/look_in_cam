import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface MapSubtype {
  key: string;
  label: string;
}

@Component({
  selector: 'app-map-type-tabs',
  templateUrl: './map-type-tabs.component.html',
  styleUrls: ['./map-type-tabs.component.css']
})
export class MapTypeTabsComponent {
  @Input() subtypes: MapSubtype[] = [];
  @Input() selectedType: string = '';
  @Output() typeSelected = new EventEmitter<string>();

  onTabChange(event: any): void {
    const selectedSubtype = this.subtypes[event.index];
    if (selectedSubtype) {
      this.typeSelected.emit(selectedSubtype.key);
    }
  }

  get selectedIndex(): number {
    return this.subtypes.findIndex(s => s.key === this.selectedType);
  }
}