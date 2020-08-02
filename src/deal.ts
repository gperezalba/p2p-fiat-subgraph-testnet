import { Deal, Offer, DealCommodity, DealPackable, OfferPackable } from "../generated/schema";
import { NewPendingDeal, VoteDeal } from "../generated/PIBP2P/PIBP2P";
import { BigDecimal, Address, BigInt } from "@graphprotocol/graph-ts";
import { pushDealToOffer } from "./offer";

export function createDeal(event: NewPendingDeal): void {
    let deal = Deal.load(event.params.dealId.toHexString());
    let offer = Offer.load(event.params.offerId.toHexString());

    if (deal == null) {
        deal = new Deal(event.params.dealId.toHexString());

        deal.offer = event.params.offerId.toHexString();
        deal.seller = offer.owner;
        deal.buyer = event.params.buyer.toHexString();
        deal.sellAmount = event.params.sellAmount;
        deal.buyAmount = event.params.buyAmount;
        deal.sellerVote = BigInt.fromI32(0);
        deal.buyerVote = BigInt.fromI32(0);
        deal.auditorVote = BigInt.fromI32(0);
        deal.isPending = true;
        deal.timestamp = event.block.timestamp;

        deal.save();

        pushDealToOffer(event.params.offerId.toHexString(), event.params.dealId.toHexString());
    }
}

export function finishDeal(dealId: string, success: boolean, executor: Address): void {
    let deal = Deal.load(dealId);

    if (deal != null) {
        deal.isPending = false;
        deal.isSuccess = success;
        deal.executor = executor;

        deal.save();
    }
}

export function updateVote(event: VoteDeal): void {
    let deal = Deal.load(event.params.dealId.toHexString());

    if (deal != null) {
        
        if (event.params.sender == Address.fromString(deal.buyer)) {
            deal.buyerVote = BigInt.fromI32(event.params.vote);
            deal.sellerVote = BigInt.fromI32(event.params.counterpartVote);
        } else {
            deal.sellerVote = BigInt.fromI32(event.params.vote);
            deal.buyerVote = BigInt.fromI32(event.params.counterpartVote);
        }

        deal.save();
    }
}