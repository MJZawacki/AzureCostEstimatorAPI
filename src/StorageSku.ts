export class StorageSku {
    
    static CalculateCost(rate: number, quantity: number): number {

        let monthlycost = rate * quantity;
        return monthlycost;
        
    }
}