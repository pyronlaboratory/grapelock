use anchor_lang::prelude::Space;
use anchor_lang::prelude::*;

#[derive(Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum OfferStatus {
    Created,
    Accepted,
    Completed,
    Refunded,
}

impl Space for OfferStatus {
    const INIT_SPACE: usize = 1; // Enum discriminant
}

#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,
    pub maker: Pubkey,
    pub taker: Option<Pubkey>,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    pub token_b_wanted_amount: u64,
    pub status: OfferStatus,
    pub bump: u8,
}
