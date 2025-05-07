use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, CloseAccount, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

use crate::{error::GrpxProtocolError, Offer, OfferStatus};

#[derive(Accounts)]
pub struct RefundRequest<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,

    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        has_one = maker,
        has_one = token_mint_a,
        has_one = token_mint_b,
        constraint = offer.taker.unwrap() == taker.key() @ GrpxProtocolError::UnauthorizedRefund,
        constraint = offer.status == OfferStatus::Accepted @ GrpxProtocolError::InvalidOfferStatus,
        seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn validate_offer_state_refund(_ctx: &Context<RefundRequest>) -> Result<()> {
    // All validations moved to account constraints for better error handling
    Ok(())
}

// Return SOL from vault to taker (buyer)
pub fn return_payment_to_taker(ctx: &Context<RefundRequest>) -> Result<()> {
    let seeds = &[
        b"offer",
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &ctx.accounts.offer.id.to_le_bytes()[..],
        &[ctx.accounts.offer.bump],
    ];
    let signer_seeds = [&seeds[..]];

    let accounts = TransferChecked {
        from: ctx.accounts.vault_token_account_b.to_account_info(),
        mint: ctx.accounts.token_mint_b.to_account_info(),
        to: ctx.accounts.taker_token_account_b.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        accounts,
        &signer_seeds,
    );

    anchor_spl::token_interface::transfer_checked(
        cpi_context,
        ctx.accounts.vault_token_account_b.amount,
        ctx.accounts.token_mint_b.decimals,
    )?;

    Ok(())
}

// Return NFT from taker back to maker
pub fn return_nft_to_maker(ctx: &Context<RefundRequest>) -> Result<()> {
    let accounts = TransferChecked {
        from: ctx.accounts.taker_token_account_a.to_account_info(),
        mint: ctx.accounts.token_mint_a.to_account_info(),
        to: ctx.accounts.maker_token_account_a.to_account_info(),
        authority: ctx.accounts.taker.to_account_info(),
    };

    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), accounts);

    // Transfer the NFT back from taker to maker
    anchor_spl::token_interface::transfer_checked(
        cpi_context,
        ctx.accounts.taker_token_account_a.amount, // Should be 1 for an NFT
        ctx.accounts.token_mint_a.decimals,
    )?;

    Ok(())
}

pub fn refund_and_close_vault(ctx: Context<RefundRequest>) -> Result<()> {
    let seeds = &[
        b"offer",
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &ctx.accounts.offer.id.to_le_bytes()[..],
        &[ctx.accounts.offer.bump],
    ];
    let signer_seeds = [&seeds[..]];

    // Close the vault token account
    let accounts = CloseAccount {
        account: ctx.accounts.vault_token_account_b.to_account_info(),
        destination: ctx.accounts.taker.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        accounts,
        &signer_seeds,
    );

    close_account(cpi_context)?;

    // Update offer status to refunded
    ctx.accounts.offer.status = OfferStatus::Refunded;

    // Note: We're not closing the offer account here so there's a record of the refunded transaction
    // If you want to close it, you would add the close = maker constraint to the offer account and
    // add more cleanup code here

    Ok(())
}
