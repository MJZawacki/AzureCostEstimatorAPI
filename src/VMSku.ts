export class VMSku {
    
    static CalculateCost(rate: number, quantity: number): number {

        let monthlycost = rate * quantity * 730;
        return monthlycost;
        
    }
}