#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("GHMkgYRXD5zosBjEePwZ3fdxTwdMF5XhCZhFqVQcM9sQ");
#[program]
pub mod grpx_dprotocols {
    use super::*;

    // === Factory Instructions ===
    pub fn create(ctx: Context<CreateCollectionNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.create(&ctx.bumps, metadata_args)
    }

    pub fn mint(ctx: Context<MintCollectionNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.mint(&ctx.bumps, metadata_args)
    }

    pub fn verify(ctx: Context<VerifyCollectionNFT>) -> Result<()> {
        ctx.accounts.verify(&ctx.bumps)
    }

    // === Escrow Instructions ===
    pub fn open(
        context: Context<OpenEscrowContract>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
    ) -> Result<()> {
        instructions::open::send_offered_tokens_to_vault(&context, token_a_offered_amount)?;
        instructions::open::save_offer(context, id, token_b_wanted_amount)
    }

    pub fn accept(context: Context<AcceptOffer>) -> Result<()> {
        instructions::accept::send_wanted_tokens_to_vault(&context)?;
        instructions::accept::transfer_nft_to_taker(context)
    }

    pub fn confirm(context: Context<ConfirmDelivery>) -> Result<()> {
        instructions::confirm::validate_offer_state_confirm(&context)?;
        instructions::confirm::send_payment_to_maker(&context)?;
        instructions::confirm::complete_and_close_vault(context)
    }

    pub fn refund(context: Context<RefundRequest>) -> Result<()> {
        instructions::refund::validate_offer_state_refund(&context)?;
        instructions::refund::return_payment_to_taker(&context)?;
        instructions::refund::return_nft_to_maker(&context)?;
        instructions::refund::refund_and_close_vault(context)
    }
}

// Finish tests
// Integrate with backend
