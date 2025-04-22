use anchor_lang::prelude::*;

#[account]
pub struct RWA {
    pub name: String,
    pub year: u16,
    pub region: String,
    pub creator: Pubkey,
    pub verified: bool,
    pub collection: Pubkey,
}
