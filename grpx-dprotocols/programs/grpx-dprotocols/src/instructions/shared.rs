use anchor_lang::prelude::*;
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MetadataArgs {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
}
