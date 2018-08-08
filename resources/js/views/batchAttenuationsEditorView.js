class AttenuationView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);
        this.svg = $(this.htmlElement).find("svg");

        this.shapes = {
            "Constant":         [ { "x":0,      "y":0   }, { "x":0,     "y":0   } ],
            "Linear":           [ { "x":0,      "y":0   }, { "x":0,     "y":0   } ],
            "Log3":             [ { "x":0,      "y":0   }, { "x":-0.8,  "y":0   } ],
            "Log2":             [ { "x":0,      "y":0   }, { "x":-0.5,  "y":0   } ],
            "Log1":             [ { "x":0,      "y":0   }, { "x":-0.3,  "y":0   } ],
            "InvertedSCurve":   [ { "x":0.6,    "y":1   }, { "x":-0.6,  "y":-1  } ],
            "SCurve":           [ { "x":0.5,    "y":0   }, { "x":-0.5,  "y":0   } ],
            "Exp1":             [ { "x":0.3,    "y":0   }, { "x":0,     "y":0   } ],
            "Exp2":             [ { "x":0.5,    "y":0   }, { "x":0,     "y":0   } ],
            "Exp3":             [ { "x":0.8,    "y":0   }, { "x":0,     "y":0   } ]
        }

        this.displayCurveType = "VolumeDryUsage";
    }

    refresh()
    {
        super.refresh();
        $(this.htmlElement).find(".RadiusMax").text(this.wwiseObject.RadiusMax + "m");
        $(this.htmlElement).find(".guid").text(this.wwiseObject.guid ? this.wwiseObject.guid : "pending commit");
        if( !this.wwiseObject.guid )
            $(this.svg).addClass("uncommitted");

        this.drawCurve(this.displayCurveType);
    }

    drawCurve(curveType)
    {
        this.resolution = {"x": 1200 / this.wwiseObject.RadiusMax, "y": 400};
        $(this.svg).empty();
        $(this.svg).attr("viewBox", "0 0 " + (this.wwiseObject.RadiusMax * this.resolution.x)  + " " + this.resolution.y);

        // if no curve, or no points, curve is not defined
        if( !this.wwiseObject.curves[curveType] || !this.wwiseObject.curves[curveType].points )
            return;

        let points = this.wwiseObject.curves[curveType].points;
        let dB = this.wwiseObject.curves[curveType].dB;

        // draw bezier
        let bezierPathStr = "";
        let pt1 = {}, pt2 = {}, cPt1 = {}, cPt2 = {};
        for( let i=0; i < points.length - 1; i++ ) {

            // clone start/end segment points
            pt1 = Object.assign(pt1, points[ i ]);
            pt2 = Object.assign(pt2, points[ i+1 ]);

            // special case for constant shape
            if( pt1.shape == "Constant" )
                pt2.y = pt1.y;

            // get control points according to shape
            cPt1 = this.getControlPoint(pt1, pt2, 0);
            cPt2 = this.getControlPoint(pt1, pt2, 1);

            let remappedPt1 = this.pointToViewBox( pt1, dB );
            let remappedPt2 = this.pointToViewBox( pt2, dB );
            let remappedCPt1 = this.pointToViewBox( cPt1, dB );
            let remappedCPt2 = this.pointToViewBox( cPt2, dB );

            bezierPathStr += "M" + remappedPt1.x + " " + remappedPt1.y + " "; // starting point (Move)
            bezierPathStr += "C" + remappedCPt1.x + " " + remappedCPt1.y + " "; // control pt 1 (Cubic)
            bezierPathStr += " " + remappedCPt2.x + " " + remappedCPt2.y + " "; // control pt 2
            bezierPathStr += " " + remappedPt2.x + " " + remappedPt2.y + " "; // ending point
        }

        let path = $(document.createElementNS("http://www.w3.org/2000/svg", "path")).attr("d", bezierPathStr);
        path.addClass(curveType);
        $(this.svg).append(path);

        // draw dots
        for( let i=0; i < points.length; i++ ) {

            // remap point
            let remapped = this.pointToViewBox( points[i], dB );

            // draw circle
            let dot = $(document.createElementNS("http://www.w3.org/2000/svg", "circle"))
                .attr("cx", remapped.x)
                .attr("cy", remapped.y)
                .attr("r", 7)
                .data('pointIndex', i);

            let attenuationView = this;
            dot.mouseover(function(e) { attenuationView.displayPointDetails(e.target); });
            dot.mouseout(function(e) { attenuationView.hidePointDetails(); });

            $(this.svg).append(dot);
        }
    }

    getControlPoint(pt1, pt2, startPoint = 0)
    {
        let shape = pt1.shape;
        let deltaX = pt2.x - pt1.x;
        let deltaY = pt2.y - pt1.y;
        let offsets = this.shapes[ shape ][ startPoint ];

        let cpt = {};
        cpt = startPoint == 0 ? Object.assign(cpt, pt1) : Object.assign(cpt, pt2);
        cpt.x += offsets.x * deltaX;
        cpt.y += offsets.y * deltaY;
        return cpt;
    }

    pointToViewBox(point, dB)
    {
        let remapped = {};
        remapped = Object.assign(remapped, point);
        remapped.x *= this.resolution.x;
        if( !dB )
            remapped.y = remapped.y / 100; // remap 0 -> 100 to 0 -> 1
        else {
            remapped.y = Math.abs(remapped.y);
            remapped.y = 1 / WwiseUtils.dBValueToRatio(remapped.y);
        }
        remapped.y *= this.resolution.y;
        return remapped;
    }

    displayPointDetails(svgCircleElement)
    {
        let curve = this.wwiseObject.curves[ this.displayCurveType ];
        let ptIndex = $(svgCircleElement).data("pointIndex");
        let point = this.wwiseObject.getPoint( this.displayCurveType, ptIndex);
        let tooltip = $("#pointTooltip");
        let coordX = point.x.toFixed(2) + " m ";
        let coordY = point.y.toFixed(2);
        let position = $(svgCircleElement).position();
        if( curve.dB ) coordY += " dB";
        tooltip.find(".ptIndex").text(ptIndex+1);
        tooltip.find(".coordX").text(coordX);
        tooltip.find(".coordY").text(coordY);
        tooltip.css(position);
        tooltip.show();
    }

    hidePointDetails()
    {
        $("#pointTooltip").hide();
    }
}

class InterpolationStepsEditorView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
        console.log("Building InterpolationStepsEditorView from " + htmlElement);
        this.htmlElement = htmlElement;
        this.batchAttenuationsEditorView = undefined; // to be set by batch att editor view
        this.focusedFieldValue = 0;

        this.steps = [];
        this.steps.push({ threshold: 0, stepLength: 1 });
        this.steps.push({ threshold: 10, stepLength: 2 });
        this.steps.push({ threshold: 20, stepLength: 5 });
        this.steps.push({ threshold: 40, stepLength: 10 });
        this.steps.push({ threshold: 100, stepLength: 50 });

        this.refresh();
    }

    refresh()
    {
        this.sortSteps();
        this.removeAllStepElements();
        for( let i=0; i < this.steps.length; i++ ) {
            this.loadStep( i, this.steps[i] );
        }

        if(this.batchAttenuationsEditorView)
            this.batchAttenuationsEditorView.refresh();
    }

    loadStep(index, step)
    {
        this.createStepElement(index, step.threshold, step.stepLength);
    }

    removeAllStepElements()
    {
        $("#stepsList").empty();
    }

    createStepElement(index, threshold, stepLength)
    {
        let newElement = $("#template_interpolationStep").contents().clone();
        //newElement.attr("id", "step" + index);
        if( index == 0 )
            newElement.find(".threshold").attr("disabled", true);

        var interpolationStepsEditorView = this;
        newElement.find(".threshold").val(threshold);
        newElement.find(".threshold").focus(function(e) {
            interpolationStepsEditorView.onFieldFocused(this);
        })
        .change(function(e) {
            interpolationStepsEditorView.onFieldChanged(this);
        })

        newElement.find(".stepLength").val(stepLength);
        newElement.find(".stepLength").focus(function(e) {
            interpolationStepsEditorView.onFieldFocused(this);
        })
        .change(function(e) {
            interpolationStepsEditorView.onFieldChanged(this, true);
        })

        newElement.find(".btn_addStep").on("click",  function(e) {
            interpolationStepsEditorView.addStep($(this).parent().index());
            return false;
        });

        // no "remove" button at index 0 - a minimum of one step is needed
        if( index == 0 )
            newElement.find(".btn_removeStep").remove();

        newElement.find(".btn_removeStep").on("click",  function(e) {
            interpolationStepsEditorView.removeStep($(this).parent().index());
            return false;
        });

        if( $(this.htmlElement).find("#stepsList li").length == 0 )
            $(this.htmlElement).find("#stepsList").append(newElement);
        else
            $(this.htmlElement).find("#stepsList li").eq(index-1).after(newElement);
    }

    getSteps()
    {
        this.steps = [];
        let interpolationStepsEditorView = this;
        $(this.htmlElement).find(".step").each(function() {
            interpolationStepsEditorView.steps.push({
                threshold: parseInt($(this).find("input.threshold").val()),
                stepLength: parseInt($(this).find("input.stepLength").val())
            })
        });
        return this.steps;
    }

    addStep(index)
    {
        let stepToCopy = this.steps[ index ];
        let newStep = {
            threshold: stepToCopy.threshold + 1,
            stepLength: stepToCopy.stepLength
        };
        this.steps.splice(index + 1, 0, newStep);
        this.refresh();
    }

    removeStep(index)
    {
        this.steps.splice(index, 1);
        this.refresh();
    }

    sortSteps()
    {
        this.steps.sort(function(a,b) {
            return a["threshold"] - b["threshold"];
        });
    }

    onFieldFocused(field)
    {
        this.focusedFieldValue = $(field).val();
    }

    onFieldChanged(field)
    {
        if( isNaN($(field).val()) )
            $(field).val( this.focusedFieldValue );
        else if( $(field).hasClass("stepLength") && $(field).val() < 1 )
            $(field).val(1);
        else $(field).val( Math.round( $(field).val() ) );

        this.getSteps();
        this.refresh();
    }
}

class InterpolationShapesEditorView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);
        console.log("Building InterpolationShapesEditorView from " + htmlElement);

        this.displayCurveType = "VolumeDryUsage";

        this.curveTypeElement = $(this.htmlElement).find(".curveType");
        this.pointsListElement = $(this.htmlElement).find("#pointsList");
        this.batchAttenuationsEditorView = undefined;
    }

    refresh()
    {
        super.refresh();
        this.curveTypeElement.text(this.displayCurveType);

        let points = this.wwiseObject.getShortest().curves[ this.displayCurveType ].points;
        this.pointsListElement.empty();
        for( let i=0; i < points.length; i++ )
            this.addPoint( i, points[i] );
    }

    addPoint(index, point)
    {
        let newElement = $("#template_interpolationShapePoint").contents().clone();
        newElement.find(".index").text( index+1 );
        newElement.find("select").val( point.interpolationShape );
        newElement.find("select").attr('class', '').addClass(newElement.find("select").val());
        this.pointsListElement.append(newElement);

        let interpolationShapesEditorView = this;
        newElement.find("select").change(function() {
            $(this).attr('class', '').addClass($(this).val());
            interpolationShapesEditorView.updatePointShape($(this).parent().index(), $(this).val());
        });
    }

    updatePointShape(index, shape)
    {
        this.wwiseObject.getShortest().curves[ this.displayCurveType ].points[ index ].interpolationShape = shape;
        this.wwiseObject.storeInterpolationShapes();
        this.batchAttenuationsEditorView.refresh();
    }
}

class BatchAttenuationsEditorView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        this.unitsPerMeter = 1;

        // child views : interpolation steps
        this.interpolationStepsEditorView = new InterpolationStepsEditorView($(this.htmlElement).find("#interpolationStepsEditor"));
        this.interpolationStepsEditorView.batchAttenuationsEditorView = this;
        // interpolation shapes
        this.interpolationShapesEditorView = new InterpolationShapesEditorView($(this.htmlElement).find("#interpolationShapesEditor"));
        this.interpolationShapesEditorView.batchAttenuationsEditorView = this;
        // interpolation errors
        this.interpolationErrorsView = new GenericView($(this.htmlElement).find("#interpolationErrors"));

        // prefix for folder attenuations, TODO: edition
        this.folderPrefix = "";

        this.attenuationViews = [];
        this.displayCurveType = "VolumeDryUsage";
        this.displayOption = "cascadeProportional";

        var batchAttenuationsEditorView = this;
        $(this.htmlElement).find(".btn_showCurve").click(function(e) {
            batchAttenuationsEditorView.onBtnShowCurveClicked(e);
            return false;
        });

        $(this.htmlElement).find(".btn_display").click(function(e) {
            batchAttenuationsEditorView.onBtnDisplayClicked(e);
            return false;
        });

        $(this.htmlElement).find(".btn_commit").click(function(e) {
            batchAttenuationsEditorView.onBtnCommitClicked(e);
            return false;
        });

        this.refresh();
    }

    setWwiseObject(wwiseObject)
    {
        super.setWwiseObject(wwiseObject);
        this.interpolationShapesEditorView.setWwiseObject(wwiseObject);
    }

    refresh()
    {
        super.refresh();

        // hide interface, empty attenuation views list
        this.interpolationErrorsView.hide();
        this.interpolationStepsEditorView.hide();
        this.interpolationShapesEditorView.hide();
        $(this.htmlElement).find("#attenuationsList").empty();
        $(this.htmlElement).find(".btn_commit").hide();

        if( !this.wwiseObject)
            return;

        // if all good
        if( this.checkForErrors() )
        {
            // show interface
            $(this.htmlElement).find(".btn_commit").show();
            this.interpolationStepsEditorView.show();
            this.interpolationShapesEditorView.show();

            // create in-between attenuations
            this.interpolate();
        }

        // display attenuation views
        for( let i=0; i < this.wwiseObject.attenuations.length; i++ )
            this.addAttenuationView(i, this.wwiseObject.attenuations[i]);

        $(this.htmlElement).find("#attenuationsList").attr("class", this.displayOption);
    }

    addAttenuationView(index, attenuation)
    {
        let newElement = $("#template_attenuationView").contents().clone();
        let newAttenuationView = new AttenuationView(newElement);
        newAttenuationView.displayCurveType = this.displayCurveType;
        newAttenuationView.setWwiseObject(attenuation);
        $(this.htmlElement).find("#attenuationsList").append(newElement);
        this.attenuationViews.push(newAttenuationView);

        if( index == 0 ) newElement.addClass("first");
        if( index == this.wwiseObject.attenuations.length-1 ) newElement.addClass("last");

        // set attenuation views positions according to display option
        if( this.displayOption == "list" )
            newElement.css({ position: "static" });
        else
        {
            let radiusDelta = this.wwiseObject.getLongest().RadiusMax - this.wwiseObject.getShortest().RadiusMax;
            let left, top;
            if( this.displayOption == "cascadeEqual" )
            {
                left = index * (49 / this.wwiseObject.attenuations.length);
                top = index * (150 / this.wwiseObject.attenuations.length);
            }
            else // this.displayOption == "cascadeProportional"
            {
                left = attenuation.RadiusMax * (49 / radiusDelta);
                top = attenuation.RadiusMax * (150 / radiusDelta);
            }
            newElement.css({ position: "absolute" });
            newElement.animate({ left: left+"%", top: top+"px" });
        }
    }

    onBtnShowCurveClicked(e)
    {
        this.displayCurveType = e.target.hash.slice(1);
        this.refresh();
        this.interpolationShapesEditorView.displayCurveType = e.target.hash.slice(1);
        this.interpolationShapesEditorView.refresh();
    }

    onBtnDisplayClicked(e)
    {
        this.displayOption = e.target.hash.slice(1);
        this.refresh();
    }

    onBtnCommitClicked(e)
    {
        this.wwiseObject.commit();
    }

    checkForErrors()
    {
        let interpolationErrors = this.wwiseObject.getInterpolationErrors();

        // no errors
        if( interpolationErrors.length == 0 )
            return true;

        // errors
        $(this.htmlElement).find("#interpolationErrorsList").empty();
        for( let i=0; i < interpolationErrors.length; i++ )
        {
            let curError = interpolationErrors[i];
            let newElement = $("#template_interpolationError_" + curError.name).contents().clone();
            for( let property in curError )
                newElement.find("."+property).text( curError[ property ] );
            $(this.htmlElement).find("#interpolationErrorsList").append(newElement);
        }

        this.interpolationErrorsView.show();
        this.displayOption = "list";
        return false;
    }

    interpolate()
    {
        this.wwiseObject.removeUncommittedAttenuations();
        this.folderPrefix = this.wwiseObject.getShortest().getNamePrefix();

        let srcRadius = this.wwiseObject.getShortest()["RadiusMax"];
        let tgtRadius = this.wwiseObject.getLongest()["RadiusMax"];
        console.log("interpolating from " + srcRadius + "m to " + tgtRadius +"m");

        let curRadius = srcRadius;
        while(curRadius <= tgtRadius)
        {
            let ratio = (curRadius - srcRadius) / (tgtRadius - srcRadius);
            //console.log(ratio);
            let curAttName = this.folderPrefix + curRadius +"m";
            let curAtt = this.wwiseObject.getAttenuationByName( curAttName );

            if( !curAtt )
                curAtt = this.wwiseObject.createAttenuation({
                    name: curAttName,
                    type: "Attenuation",
                    RadiusMax: curRadius
                });

            if(ratio != 0 && ratio != 1)
                curAtt.interpolate(this.wwiseObject.getShortest(), this.wwiseObject.getLongest(), ratio);

            let step = this.getStep(curRadius);
            curRadius += step;
        }

        this.wwiseObject.sortChildrenByRadius();
    }

    getStep(radius)
    {
        let stepsCopy = [];
        stepsCopy = Object.assign(stepsCopy, this.interpolationStepsEditorView.getSteps());
        stepsCopy.sort(function(a,b) {
            return b["threshold"] - a["threshold"];
        });
        for( let i=0; i < stepsCopy.length; i++ )
            if( radius >= stepsCopy[i].threshold )
                return stepsCopy[i].stepLength;
        return 1;
    }
}
