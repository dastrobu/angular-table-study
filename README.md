# matrix-view
This is an architecture study, to evaluate the implementation of a feature rich table representation of two 
dimensional data, i.e. a matrix.

## Content
 * [Customization and Styling](#customization-and-styling)
 * [Features](#features)
 * [Browser Support](#browser-support)
 * [Known Issues](#known-issues)
 * [Demos](#demos)

## Customization and Styling

The primary goal of the matrix-view is to have a highly customizable component. That means, no styling will 
be implemented on this component. Instead the component should be as customizable as possible 
via [Angular templates](https://angular.io/guide/template-syntax).

The strategy, to make styling as customizable as possible is to use templates with structural directives. 
This allows to define templates for various elements fo the matrix view and also to pass styles.
The following example shows, how to define a template for a cell, which renders cell value together with
the index of the cell.
```html
<ng-container *matrixViewCell="let cellValue; let index=index">
    {{cellValue}} (row: {{index.row}}, col: {{index.col}})
</ng-container>
```

Currently there are directives for 
 * cells  
    Template and styling can be specified via the [matrixViewCell](src/app/matrix-view/directives/matrix-view-cell.directive.ts)
    If no matrixViewCell directive is provided, `cell.value` will be rendered by default. 
    This template may be overridden for fixed areas.
 * fixed cells 
    Template and styling can be specified via the [matrixViewFixedCell](src/app/matrix-view/directives/matrix-view-fixed-cell.directive.ts)
    If no matrixViewCell directive is provided, the fixed cell will be rendered like the scrollable cells.
    Template and styling can be overridden for specific fixed areas by employing the following directives
     * [matrixViewFixedTopCell](src/app/matrix-view/directives/matrix-view-fixed-top-cell.directive.ts)
     * [matrixViewFixedRightCell](src/app/matrix-view/directives/matrix-view-fixed-right-cell.directive.ts)
     * [matrixViewFixedBottomCell](src/app/matrix-view/directives/matrix-view-fixed-bottom-cell.directive.ts)
     * [matrixViewFixedLeftCell](src/app/matrix-view/directives/matrix-view-fixed-left-cell.directive.ts)
 * fixed corners
    Template and styling can be specified via the [matrixViewFixedCorner](src/app/matrix-view/directives/matrix-view-fixed-corner.directive.ts)
    Template and styling can be overridden for specific fixed corners by employing the following directives
     * [matrixViewFixedTopLeftCorner](src/app/matrix-view/directives/matrix-view-fixed-top-left-corner.directive.ts)
     * [matrixViewFixedTopRightCorner](src/app/matrix-view/directives/matrix-view-fixed-top-right-corner.directive.ts)
     * [matrixViewFixedBottomLeftCorner](src/app/matrix-view/directives/matrix-view-fixed-bottom-left-corner.directive.ts)
     * [matrixViewFixedBottomRightCorner](src/app/matrix-view/directives/matrix-view-fixed-bottom-left-corner.directive.ts)

### Performance

Doing styling alone via templates can clutter the DOM unnecessarily, especially for cells. To illustrate, 
consider, if the background of a cell should be red, which can be achieved with the 
following cell template 
```html
<div *matrixViewCell="let cellValue" style="background: red">
    {{cellValue}}
</div>
```
This would double the amount of divs in the DOM compared to the unstyled template 
Remember that 
[ng-container](https://angular.io/guide/structural-directives#ng-container-to-the-rescue) 
is not represented in the DOM.
```html
<ng-container *matrixViewCell="let cellValue" style="background: red">
    {{cellValue}}
</ng-container>
```
To avoid inflating the DOM, simple CSS styles should be passed directly via the directives, like 
in the following example.
```html
<ng-container *matrixViewCell="let cellValue haveStyle {'background': 'red'}">
    {{cellValue}}
</ng-container>
```
### Grid
There is no special support for rendering a grid. This can be simply done via styling the cells.
The following example shows, how to style the cells:
```html
<ng-container *matrixViewCell="let cellValue haveStyle {'border-bottom': '1px solid black'; 'border-right': '1px solid black'}">
    {{cellValue}}
</ng-container>
```
Together with a border on the whole matrix view, this gives a nice grid.


## Features

The features are either implemented or planned.

 * [Fixed Columns and Rows](#fixed-columns-and-rows) (implemented)
 * [Virtual DOM](#virtual-dom) (implemented)
 * [Selection Model](#selection-model) (planned)
 * [Column Resizing via Drag and Drop](#column-resizing-via-drag-and-drop) (planned)
 * [Column Permutation via Drag and Drop](#column-permutation-via-drag-and-drop) (planned)
 * [Colspan and Rowspan](#colspan-and-rowspan) (planned)

### Fixed Columns and Rows

A fixed or sticky header and fixed columns are supported.

The idea is that the matrix features several areas that are fixed, to be used as headers 
and footers or for fixed columns. 

<!-- HTML table (not markdown) for proper formatting -->
<table>
<tr>
<td>fixed-top-left</td> <td>fixed-top</td> <td>fixed-top-right</td>
</tr>
<tr>
<td>fixed-left</td> <td>canvas</td> <td>fixed-right</td>
</tr>
<tr>
<td>fixed-bottom-left</td> <td>fixed-bottom</td> <td>fixed-bottom-right</td>
</tr>
</table>

The corners are only shown, if tow adjacent fixed areas are shown but can also be configured in
detail. 

#### Implementation

In general there is no concept of sticky positioning or one-direction fixed positioning in CSS. 
One has to choose from relative, absolute or fixed positioning the fixed parts and synchronize 
the other direction manually through code.

Pure CSS fixed positioning is only possible, if the table is scrollable in one direction only. 
In this case the fixed parts can be positioned outside the scrollable container. 
This is, however, not sufficient to implement a table, which can visualize an arbitrary number 
of columns and rows. 
In this case, CSS [sticky](https://www.w3schools.com/cssref/pr_class_position.asp) positioning 
is not even sufficient, apart from the problem, that IE does not support sticky positioning. 

##### Positioning Strategy

In general there are two options, to position fixed rows and columns. Either one 
positions the sections relative and updates the position when scrolling (along the axis)
or one positions elements absolute and updates normal to the axis. Since the problem is the 
same for fixed rows and columns, the term header shall be used in the following for brevity.

In pseudo code one could write either:

    // header is positioned relative
    header.style.marginTop = container.scrollTop 
  
or  

    // header is positioned absolute
    header.style.left = -container.scrollLeft 
    
It turns out that the latter positioning strategy leads to a much smoother scrolling experience 
in some cases and browsers. The combination of positioning and scrolling varies significantly 
in different browsers and should be also tested when dragging the scrollbar, using the mouse wheel, 
clicking on the scrollbar and using a touch device. The scroll events are handled differently 
and lead to significant variations on how smooth the scroll events are synchronized to the
position updates.

Instead of simply setting the `left` and `top` properties, one can also work with CSS transformations, 
such as `translate` or `translated3d`. There are rumors, that `translated3d` can be faster, since the 
browser should transfer the computation to the GPU, but this was not tested or verified.

Apart form relative and absolute positioning one can also use fixed positioning. However, this 
has the problem, that the scroll events on the window interfere with the scroll events on the container. 
Hence, this approach was discarded.

In the end, a combination of relative and fixed positioning is used to get best results. 
The fixed areas must be embedded in another container to handle the overflow, then these fixed containers
must be positioned absolutely w.r.t. the hosting element, which is not itself scrollable. This finally 
leads to a rather smooth scrolling experience.

###### Scroll Synchronisation

Fixed columns and rows require scroll synchronisation, if scrolling in two directions is 
supported. 

First of all, there are two different events for scrolling. The scroll event, the wheel event. 
To implement scroll event handler properly, it is important to know, that 
[scroll events](https://developer.mozilla.org/en-US/docs/Web/Events/scroll) are 
not [cancelable](https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable) and 
[wheel events](https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable) are. 
Consequently, one should not bind any event handlers to 
the wheel event, since the event handlder must be executed completely, before the browser can 
execute the scoll event (because the event handler could call `preventDefault()` on the wheel event).

When implementing the scroll event handler, performance must be monitored carefully. 
If the event handler executes too long, scroll synchronisation will not be smooth.
A nice [article](https://medium.com/paramsingh-66174/catalysing-your-angular-4-app-performance-9211979075f6) 
on performance optimizations addresses this issue.

###### Limitations

There are some limitations. 

 * Scroll events in IE  
   Due to the involved event handling, scroll synchronisation is not always perfectly smooth. 
Especially in IE11, there is a problem, when clicking on the scroll bar.
In this case, only one scroll event is fired, and the update on the header position is updated 
in one step. Hence the header jumps to the correct position after one clicks on the scroll bar. 
This effect cannot be solved, since it depends on the events fired by the browser. 
See also the discussion on [Stackoverflow](https://stackoverflow.com/q/21775234/1458343). 
Note that this behaviour can also be observed in ExtJS grids, handsontable and other table 
implementations.

 * Wheel events on fixed areas  
   Wheel events on fixed positioned elements are handled different in Chrome and IE. This means, 
   the view cannot be scrolled via the wheel, when the mouse is positioned over the fixed areas in chrome.
   Custom event propagation may be implemented, but it is not clear, if this will cause any issues.
   
 * Stacking of fixed areas cannot be configured. If fixed corners are not shown, there are several 
   options to determine which fixed area is shown on top of another area. In the future one could make
   the configurable, currently, however, the order is fixed to be 
   1. left
   2. bottom
   3. top
   4. right (foreground)
   If this is changed, one must take care of some corner cases. Especially, if the canvas is smaller 
   than the viewport, fixed right must be in foreground. Otherwise, it will be difficult to render 
   fixed top rows in the fixed right area correctly.

### Virtual DOM

For performance reasons, a virtual DOM is used. This means, that not all elements of the matrix
are represented in the DOM at all time, since this can cause huge performance issues for big data sets.
DOM virtualization in this case means, that only the cells, visible in the viewport, or those that 
are getting close to be visible are represented in the DOM. All other cells exist only in virtually, 
meaning only cell values are kept im memory, but no actual elements to show the cells exist in the DOM.
The naive approach, to implement a virtual DOM would be to show and hide all cells, depending on the 
scroll position via `*ngIf`. This would, however, cause a huge number of checks, after each update of the 
scroll position and on each scroll event, it must be computed, which cells to show and which to hide. 
To keep the computation on each scroll event as fast as possible, the concept of tiles is introduces.
A tile is simply a rectangular part of the canvas. So the canvas is simply subdivided into a set of tiles.
Each tile is kept in the DOM at all time. The cells, that lie inside the tile are only shown, if the tile 
is visible in the viewport. Since the number of tiles is much smaller than the number of cells, 
it can be computed very, fast which tiles to show and which to hide. 
To improve scroll performance even more, especially in slow browser like the IE, one can prefetch a certain 
amount of tiles, that get close to the viewport. This means, that cells, that are about to come visible 
through scrolling, are created before they come visible (at leas for smooth scrolling via the wheel). 
For key press actions like page down or end, one might observe some latency for big data sets and slow 
browsers. By default, one tile outside the viewport is prefetch.

The tile size can be configured via the `config` input. In general, big tiles speed up the computation 
on scroll events (which tiles to show) but lead to more elements in the DOM, since also some cells are kept 
in the DOM, which are inside the tile but not on the viewport. Small tiles, on the other hand, make sure 
that most cells, which are invisible are removed from the DOM but require more effort to update there
visibility state on scrolling. Hence, it is a trade of how big the tile size should be chosen.

### Selection Model

*planned*

One should be able to select columns, rows and cells in any combination.
   
### Column Resizing via Drag and Drop

*planned*

### Column Permutation via Drag and Drop

*planned*

It is not planned to implement a ful drag and drop handler and some special rendering. 
Instead, an API is defined, which allows to implement drag and drop from, e.g. a 
header cell. 

### Colspan and Rowspan

*planned*

### Grid

*planned*
It is possible to render a grid between rows and columns. 

## Browser Support

Chrome, Firefox, Safari and Internet Explorer (11 and up) should be supported.

## Performance

### Scrolling

Smooth scrolling is important. Scroll events must be handled for [scroll synchronisation](#scroll-synchronisation) 
and for the [virtual DOM](#virtual-dom).

### Change Detection

Change detection can cause performance issues, hence, the default strategy is replaced 
by `ChangeDetectionStrategy.OnPush`. This requires that all inputs are either immutable or passed as
observables, to keep track of changes. A detailed discussion can be found in the article 
[Angular OnPush Change Detection and Component Design - Avoid Common Pitfalls](https://blog.angular-university.io/onpush-change-detection-how-it-works/).


## Known Issues

 * Fixed areas do not work correctly, if the number for rows/cols is smaller or equal to the number of fixed cols/rows.
 * Wheel scrolling over fixed areas does not work in Chrome.
 * When there are more fixed columns than columns, display is a bit strange, since cells 
   are displayed in two fixed areas. Can be fixed easily.
 * In rare case, some content is not displayed on fixed areas after creation. After the first scroll event, 
   all content is shown correctly. Reason is unknown.
 
## Demos
 
The following demos should be implemented as show cases.
  * zebra effect on rows
  * hover on columns and rows.
  * filtering
  * sorting
  * drag and drop on columns
  * matrix without horizontal scrolling
  * row and columns selection
  
