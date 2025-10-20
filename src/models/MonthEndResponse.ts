export interface MonthEndResponse {
    /*
@JsonProperty("Year")
    private int year;

    @JsonProperty("Month")
    private String month;

    @JsonProperty("PreviousMonthLeftover")
    private float previousMonthLeftover;

    @JsonProperty("Cash")
    private int wallet;

    @JsonProperty("Yes")
    private float yesBalance;

    @JsonProperty("SBI")
    private float sbiBalance;

    @JsonProperty("HSBC")
    private float hsbcBalance;

    @JsonProperty("Amazon")
    private float amazonWallet;

    @JsonProperty("Myntra")
    private float myntraWallet;

    @JsonProperty("Flipkart")
    private float flipkartWallet;

    @JsonProperty("SwiggyZomato")
    private float swiggyZomatoWallet;
    */

    year: number;
    month: string;
    previousMonthLeftover: number;
    wallet: number;
    yesBalance: number;
    sbiBalance: number;
    hsbcBalance: number;
    amazonWallet: number;
    myntraWallet: number;
    flipkartWallet: number;
    swiggyZomatoWallet: number;
}