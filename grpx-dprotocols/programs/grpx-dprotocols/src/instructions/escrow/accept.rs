// use super::transfer_tokens;
// use crate::{error::GrpxProtocolError, Offer, OfferStatus};
// use anchor_lang::prelude::*;
// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked},
// };

// #[derive(Accounts)]
// pub struct AcceptOffer<'info> {
//     #[account(mut)]
//     pub taker: Signer<'info>,

//     #[account(mut)]
//     pub maker: SystemAccount<'info>,

//     pub token_mint_a: InterfaceAccount<'info, Mint>,

//     pub token_mint_b: InterfaceAccount<'info, Mint>,

//     #[account(
//         init_if_needed,
//         payer = taker,
//         associated_token::mint = token_mint_a,
//         associated_token::authority = taker,
//         associated_token::token_program = token_program,
//     )]
//     pub taker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

//     #[account(
//         mut,
//         associated_token::mint = token_mint_b,
//         associated_token::authority = taker,
//         associated_token::token_program = token_program,
//     )]
//     pub taker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

//     #[account(
//         init_if_needed,
//         payer = taker,
//         associated_token::mint = token_mint_b,
//         associated_token::authority = offer,
//         associated_token::token_program = token_program,
//     )]
//     pub vault_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

//     #[account(
//         mut,
//         close = maker,
//         has_one = maker,
//         has_one = token_mint_a,
//         has_one = token_mint_b,
//         constraint = offer.status == OfferStatus::Created @ GrpxProtocolError::InvalidOfferStatus,
//         seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
//         bump = offer.bump
//     )]
//     offer: Account<'info, Offer>,

//     #[account(
//         mut,
//         associated_token::mint = token_mint_a,
//         associated_token::authority = offer,
//         associated_token::token_program = token_program,
//     )]
//     pub vault: InterfaceAccount<'info, TokenAccount>,

//     pub associated_token_program: Program<'info, AssociatedToken>,
//     pub token_program: Interface<'info, TokenInterface>,
//     pub system_program: Program<'info, System>,
// }

// pub fn send_wanted_tokens_to_vault(ctx: &Context<AcceptOffer>) -> Result<()> {
//     transfer_tokens(
//         &ctx.accounts.taker_token_account_b,
//         &ctx.accounts.vault_token_account_b,
//         &ctx.accounts.offer.token_b_desired_amount,
//         &ctx.accounts.token_mint_b,
//         &ctx.accounts.taker,
//         &ctx.accounts.token_program,
//     )
// }

// pub fn transfer_nft_to_taker(ctx: Context<AcceptOffer>) -> Result<()> {
//     let seeds = &[
//         b"offer",
//         ctx.accounts.maker.to_account_info().key.as_ref(),
//         &ctx.accounts.offer.id.to_le_bytes()[..],
//         &[ctx.accounts.offer.bump],
//     ];
//     let signer_seeds = [&seeds[..]];

//     let accounts = TransferChecked {
//         from: ctx.accounts.vault.to_account_info(),
//         mint: ctx.accounts.token_mint_a.to_account_info(),
//         to: ctx.accounts.taker_token_account_a.to_account_info(),
//         authority: ctx.accounts.offer.to_account_info(),
//     };

//     let cpi_context = CpiContext::new_with_signer(
//         ctx.accounts.token_program.to_account_info(),
//         accounts,
//         &signer_seeds,
//     );

//     anchor_spl::token_interface::transfer_checked(
//         cpi_context,
//         ctx.accounts.vault.amount,
//         ctx.accounts.token_mint_a.decimals,
//     )?;

//     // Update offer status to Accepted and record taker
//     ctx.accounts.offer.status = OfferStatus::Accepted;
//     ctx.accounts.offer.taker = Some(ctx.accounts.taker.key());

//     Ok(())
// }
