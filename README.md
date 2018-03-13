# matrix-view
This is an architecture study, to evaluate the implementation of a feature rich table representation of two 
dimensional data, i.e. a matrix.

 * [Browser Support](#browser-support)
 * [Features](#features)

## Browser Support

Chrome, Firefox, Safari and Internet Explorer (11 and up) should be supported.

## Features

### Fixed Columns and Rows

A fixed or sticky header and fixed columns are supported.

The idea is that the matrix features several areas that are fixed, to be used as headers 
and footers or for fixed columns. 

fixed-top-left | fixed-top | fixed-top-right
-------------- | ----------| ---------------
fixed-left     | canvas    | fixed-right
fixed-bottom-left | fixed-bottom | fixed-bottom-right

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
