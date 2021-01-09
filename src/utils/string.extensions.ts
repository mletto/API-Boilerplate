interface String {
    isEmpty(): boolean
}

String.prototype.isEmpty = function() {
    return this.length === 0 ? true : false ;
};