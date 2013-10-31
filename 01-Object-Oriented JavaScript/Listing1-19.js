// Define an object called Class with a ‘create’ method for use creating classes.
// Use a closure to maintain inner functions without exposing them publicly.
var Class = (function() {

    // The ‘create’ method defines and returns a new class when called, based on an object
    // literal representing the public properties and methods for its prototype. A method named
    // ‘initialize’ will be executed as the constructor function. If an optional
    // ‘parentPrototype’ property is passed in, representing a parent class, it creates the new
    // class as a sub-class of that.
    function create(classDefinition, parentPrototype) {

        // Define the constructor function of a new class, using the ‘initialize’ method from the
        // ‘classDefinition’ object literal if it exists
        var NewClass = function() {
                if (this.initialize && typeof this.initialize === 'function') {
                    this.initialize.apply(this, arguments);
                }
            },
            name;

        // If a ‘parentPrototype’ object has been passed in (when inheriting from other
        // classes), inherit everything from the parent to this sub-class
        if (parentPrototype) {
            NewClass.prototype = new parentPrototype.constructor();
        }

        // Apply the newly provided class definition, overriding anything that already exists
        // from the parentPrototype
        for (name in classDefinition) {
            if (classDefinition.hasOwnProperty(name)) {

                // If we’re attempting polymorphism, creating new methods named the same as
                // ones from the parent class, then we want to expose a way of calling the
                // parent function of the same name in a simple way
                if (parentPrototype && parentPrototype[name] &&
                        typeof classDefinition[name] === 'function') {

                    // We create a closure and return a function to replace the one passed in,
                    // wrapping it and providing a ‘_parent()’ method which points to the method
                    // of the same name from the parent class
                    NewClass.prototype[name] = (function(thisFunction, parentFunction) {
                        return function() {
                            var output;

                            // Expose the parent class function of the same name as a
                            // method named ‘_parent’
                            this._parent = parentFunction;

                            // execute the function we’re replacing – allowing that function
                            // to access the ‘_parent’ method if it so wishes
                            output = thisFunction.apply(this, arguments);

                            // Remove the ‘_parent’ method now the function has executed
                            delete this._parent;

                            // Return the output of the original function
                            return output;
                        };
                    }(classDefinition[name], parentPrototype [name]));
                } else {

                    // If we’re not attempting polymorphism, just map over the entry from the
                    // ‘classDefinition’ object literal to the prototype directly
                    NewClass.prototype[name] = classDefinition[name];
                }
            }
        }

        // Ensure the constructor is set correctly, whether inherited or not (in case a
        // ‘constructor’ property or method was passed in the ‘classDefinition’ object literal)
        NewClass.prototype.constructor = NewClass;

        // Define an ‘extend’ method on the class itself, pointing to the private ‘extend’
        // function, below, which allows the current class to be used as a parent for
        // a new sub-class
        NewClass.extend = extend;

        return NewClass;
    }

    // The ‘extend’ method is the same as the ‘create’ method but with an additional parameter
    // containing the prototype from the parent class for inheriting from
    function extend(classDefinition) {
        return create(classDefinition, this.prototype);
    }

    // Expose the private ‘create’ method publicly under the same name
    return {
        create: create
    };
}());