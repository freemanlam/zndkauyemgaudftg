import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

/**
 * Wrapper element with styles
 */
@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ControlsComponent { }
