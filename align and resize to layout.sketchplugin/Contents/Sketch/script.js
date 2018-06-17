/*  2018.06.17, By: Kevin van Breemaat, kevinvanbreemaat.nl     */


// variable to story two variables. Snaps and selection.
let threadDictionary = NSThread.mainThread().threadDictionary();

// shortcut command: shift+cmd+ctrl and <--
function setWidthColLeft(){     setWidthOfSelection(    calcNewWidth(-1)    );  }

// shortcut command: shift+cmd+ctrl and -->
function setWidthColRight(){    setWidthOfSelection(    calcNewWidth(1)     );   }

// calculate the new width for the current selection
function calcNewWidth(n_){
    var selectionXpos =  threadDictionary.selectedLayers[0].frame().x();        // get selection x pos (always the latest)
    var selectionWidth =  threadDictionary.selectedLayers[0].frame().width();   // get selection width (always the latest)
    var xPosOfRightSide = selectionXpos + selectionWidth;                       // the most right position of the selection is x + width
    var clossestSnapPointI = sg_calculateClosestColToXpos(xPosOfRightSide) + n_;// find clossets snap point for the most right position
    var width = threadDictionary.snaps[clossestSnapPointI] - selectionXpos;     // the new width is the snap point value for the clossestSnapPointI minus the selection x pos
    if(width <= 0)width = 1;                                                    // safeguard to make sure width is always minum 1. (sketch cant handle - or zero)
    return width;
}

// apply a width position to the entire selection
function setWidthOfSelection(width_){
    // loop selection and set new width to all layers
    for (var i = 0; i < threadDictionary.selectedLayers.count(); i++)threadDictionary.selectedLayers[i].frame().width = width_;
}

// shotcut command: cmd+ctrl  and <--
function moveColLeft(){     setXofSelection(    calcMoveColX(-1)    );  }

// shotcut command: cmd+ctrl  and -->
function moveColRight(){    setXofSelection(    calcMoveColX(1)     );   }

//
function calcMoveColX(n_){
    var selectionXpos =  threadDictionary.selectedLayers[0].frame().x();        // get the x pos from the first selected layer. NOT the group!. Maybe one day.
    var closestI = sg_calculateClosestColToXpos(selectionXpos) + n_;            // caclulated the value find the closest value from X_ in a array.
    var newX = threadDictionary.snaps[closestI];                                // new x position is the newly found value.
    return newX;
}

// apply a x value to the entire selection
function setXofSelection(newx_){
    // loop selection and set x value to all layers
    for (var i = 0; i < threadDictionary.selectedLayers.count(); i++)threadDictionary.selectedLayers[i].frame().x = newx_;
}


//    find the closest value from X_ in a array.
function sg_calculateClosestColToXpos(x_) {
    var lowestDif = 10000;                                                      // really high lowestDif value that can't not be replaced.
    var closestI = 100;                                                         // random value that wont actually exist
    for (var i = 0; i < threadDictionary.snaps.length; i++) {                   // loop the array_
        var dif = Math.abs(threadDictionary.snaps[i] - x_);                     // take the X value and array value. En make er een absolute getal van (geen negatives)
        // log(i + " : " + threadDictionary.snaps[i] + " dif: " + dif);         // for debugging
        if(dif < lowestDif) {                                                   // als result lower is then last lowest replace with new lowest.
            lowestDif = dif;                                                    // set new lowest
            closestI = i;                                                       // save the array position of the new lowest.
        }
    }
    // return the position in the array instead of the value.
    return closestI;
}

// Sketch action. Everytime a user makes a new selection this will be called.
function SelectionChanged(context) {
    threadDictionary.selectedLayers = context.actionContext.newSelection;        // save the new selection in a global plugin variable
}

// Sketch action. Everytime a user changes artboards this will be called
// main purpuse is the find out what the users layout is. I couldn't find a Sketch way to do this.. so lemme know if there is one.
function ArtboardChanged(context) {
    var sg_xPosSnapPoints = [];                                                 // empty array to store layout x values in for later.

    var ab = context.actionContext.newArtboard;                                 // get new artboard values.
    var abwidth = ab.frame().width();                                           // get artboard width
    var ablayout = ab.layout();                                                 // artboard specific layoutstuff
    var maxWidth = ablayout.totalWidth();                                       // get layout total width
    var sg_numberColls = ablayout.numberOfColumns();                            // get the number of collumns
    var sg_collWidth = ablayout.columnWidth();                                  // get col width
    var sg_gutterWidth = ablayout.gutterWidth();                                // get guttwerwidth
    var layoutstate = ablayout.isEnabled();                                     // not using this but had to google a while to find it. This is for safekeeping
    var abGuttersOutside = ablayout.guttersOutside();                           // not using this but had to google a while to find it. This is for safekeeping


    var sg_offSet = ( abwidth - maxWidth ) / 2;                                 // calc the offset value.
    if(abGuttersOutside == 1)sg_offSet +=  sg_gutterWidth/2;                    // calc the offset value if gutters are outside


    for (var i = 0; i < sg_numberColls*2 + 2; i++) {                            // add two for the absolute 0. and add 1 for the offset.
            sg_xPosSnapPoints.push(0);                                          // create a position for sg_xPosSnapPoints.
            if(i == 0)sg_xPosSnapPoints[i] = 0;                                 // set 0 to be the edge of the artboard.
            if(i == 1)sg_xPosSnapPoints[i] = sg_offSet ;                        // set 1 to be thet offset.
            if(i >= 2 && i < sg_numberColls*2 + 2){                             // loop cols
                if(i & 1)   sg_xPosSnapPoints[i] = sg_xPosSnapPoints[i-1] + sg_gutterWidth;// uneven is a gutter
                else        sg_xPosSnapPoints[i] = sg_xPosSnapPoints[i-1] + sg_collWidth;// even is a column
            }
            if(i == sg_numberColls*2 + 1)sg_xPosSnapPoints[i] = abwidth;        // add 1 spot for the maxwidth
    }

    threadDictionary.snaps = sg_xPosSnapPoints;                                 // save in the global value.
}

function openUrlInBrowser(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}

function website() {
    console.log("open");
    openUrlInBrowser("http://kevinvanbreemaat.nl/");
};
