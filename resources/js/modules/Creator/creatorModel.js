class Creator extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        this.wwiseObject = new CreatorWwiseObject(selectedObjects[0], waapiJS, debug);
    }

    get viewObject()
    {
        return this.wwiseObject;
    }
}

class CreatorWwiseObject extends WwiseObject
{
    createNewChildren(type, prefix, list)
    {
        this.removeChildren();
        for(let i=0; i < list.length; i++)
        {
            let newName = prefix + list[i];
            this.createNewChild({
                type: type,
                name: newName,
                path: this.path + "\\" + newName
            });
        }
    }

    createNewChild(object)
    {
        let newChild = new WwiseObject(object, this.waapiJS);
        newChild.parent = this;
        this.childrenObjects.push(newChild);
        return newChild;
    }

    removeChildren()
    {
        let i = this.childrenObjects.length;
        while( i-- ) {
            this.childrenObjects.splice(i, 1);
        }
    }

    commit()
    {
        console.log("committing to wwise");
        this.childrenToCommit = [];
        for(let i=0; i < this.childrenObjects.length; i++)
            this.childrenToCommit.push(this.childrenObjects[i]);
        return this.commitNextChild();
    }

    commitNextChild()
    {
        if( this.childrenToCommit.length < 1) {
            console.log("All children committed for " + this.name);
            return;
        }
        let nextChildToCommit = this.childrenToCommit.shift();
        let self = this;
        return nextChildToCommit.commit().then(
            function() {
                return self.commitNextChild();
            },
            function() {
                console.log("Failed to create child object, aborting");
                return Promise.reject();
            },
        );
    }
}
