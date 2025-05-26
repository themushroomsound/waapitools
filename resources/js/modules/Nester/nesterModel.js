class Nester extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        console.log("Building Nester");

        this.waapiJS = waapiJS;
        this.selectedObjects = selectedObjects.map(obj => new WwiseObject(obj, waapiJS)); // convert selected objects to WwiseObject instances

        if( this.selectedObjects.length < 1) {
            console.log("No selected objects");     
            return;
        }

        // create the the WwiseObject that will be used to create new nesting parents
        // it represents the parent of the selected objects
        this.creator = new NesterCreatorWwiseObject(this.selectedObjects[0].parent, this.waapiJS, true, this);
    }

    // redirecting to the creator object as the view's source
    get viewObject()
    {
        if( !this.creator ) {
            return new NesterCreatorWwiseObject(undefined, this.waapiJS, true, this);
        }
        return this.creator;
    }    

    // move all selected objects to their new parents
    nestSelectedObjects()
    {
        console.log("Nesting selected objects");
        this.objectsToNest = this.selectedObjects;
        return this.nestNextSelectedObject();
    }

    // move the next selected object to be nested to its new parent
    nestNextSelectedObject()
    {
        if( this.objectsToNest.length < 1) {
            console.log("All objects nested");
            return Promise.resolve();
        }

        let self = this;
        let nextObjectToNest = this.objectsToNest.shift();
        let newParent = this.creator.getNestingParent(nextObjectToNest);
        if( !newParent ) {
            console.log("No parent found for " + nextObjectToNest.name);
            return Promise.reject("No parent found for " + nextObjectToNest.name);
        }

        return this.waapiJS.moveObject(nextObjectToNest.guid, newParent.guid).then
        ( 
            function() {
                return self.nestNextSelectedObject();
            }, 
            function(error) {
                console.log("Error nesting object", error);
                return Promise.reject(error);
            }
        );
    }
}

// This object represents the parent of the selected objects
// It is used to create new nesting parents and commit them
class NesterCreatorWwiseObject extends CreatorWwiseObject
{
    constructor(wwiseObject, waapiJS, debug = false, nester)
    {
        super(wwiseObject, waapiJS, debug);
        this.nester = nester;
    }

    fetchData()
    {
        if( !this.guid ) {
            console.log("NesterCreatorWwiseObject not properly initialized");
            return Promise.reject("NesterCreatorWwiseObject not properly initialized");
        }

        // fetch the path, type and category of the parent object (missing from the selected objects' parent data)
        let self = this
        let query = {
            from:{id:[this.guid]}
        };
        return this.waapiJS.queryObjects(query).then(
            function(res) {
                self.path = res.kwargs.return[0]["path"];
                self.type = res.kwargs.return[0]["type"];
                self.category = res.kwargs.return[0]["category"];
                return Promise.resolve();
            },
            function(error) {
                console.log("Error fetching data for NesterCreatorWwiseObject", error);
                return Promise.reject(error);
            }
        );
    }

    createNewChildren(type)
    {
        const parentNames = extractBaseNames(this.nester.selectedObjects.map(obj => obj.name));
        super.createNewChildren(type, "", parentNames);
    }

    commitChildren()
    {
        self = this
        return super.commitChildren().then(
            function() {
                console.log("All children committed for " + self.name + ", now nesting selected objects");
                return self.nester.nestSelectedObjects()
            }, 
            function(error) {
                console.log("Error committing children for NesterCreatorWwiseObject", error);
                return Promise.reject(error);
            }
        );
    }

    // amongst created children, find the one to parent one of the selected objects
    // this is the one whose name is contained in the selected object name
    // e.g. "MyObject_01" will be parented to "MyObject"
    getNestingParent(selectedObject)
    {
        for(const child of this.childrenObjects)
        {
            if (selectedObject.name.includes(child.name)) {
                return child;
            }
        }
        return null;
    }

    // get the selected objects that will be nested under the given child
    getSelectedObjectsToBeNested(child)
    {
        let selectedObjectsToBeNested = [];
        for(const selectedObject of this.nester.selectedObjects)
        {
            if( selectedObject.name.includes(child.name) ) {
                selectedObjectsToBeNested.push(selectedObject);
            }
        }
        return selectedObjectsToBeNested;
    }
}

// Extract base names from a list of names
function extractBaseNames(names) {
    const baseSet = new Set();

    for (const name of names) {
        // Match the last "word" token (after space, underscore, dash, etc.)
        const parts = name.split(/([ _-])/);  // keep delimiters

        // Find the last actual content token
        let lastTokenIndex = parts.length - 1;
        while (lastTokenIndex >= 0 && !/\w/.test(parts[lastTokenIndex])) {
            lastTokenIndex--;
        }

        // If the last meaningful token contains a digit, remove it and its separator (if any)
        if (/\d/.test(parts[lastTokenIndex])) {
            const isSeparator = /[ _-]/.test(parts[lastTokenIndex - 1]);
            const baseParts = parts.slice(0, lastTokenIndex - (isSeparator ? 1 : 0));
            baseSet.add(baseParts.join(''));
        } else {
            baseSet.add(name);
        }
    }

    return Array.from(baseSet).sort();
}