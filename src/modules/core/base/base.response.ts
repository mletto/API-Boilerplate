class SuccessfullResponse {

    public error: boolean;
    
    constructor(public statusCode: number, public data: any){
        this.error = false
        this.statusCode = statusCode
        this.data = data
    }
}

export default SuccessfullResponse