use crate::{error::GrpxProtocolError, Offer, OfferStatus};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

#[derive(Accounts)]
pub struct ConfirmOffer<'info> {
    #[account(mut)]
    pub producer: SystemAccount<'info>,

    #[account(mut)]
    pub consumer: Signer<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,

    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = consumer,
        associated_token::mint = token_mint_b,
        associated_token::authority = producer,
        associated_token::token_program = token_program,
    )]
    pub producer_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = consumer,
        associated_token::mint = token_mint_a,
        associated_token::authority = consumer,
        associated_token::token_program = token_program,
    )]
    pub consumer_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        close = consumer,
        has_one = producer,
        has_one = token_mint_b,
        constraint = offer.consumer == Some(consumer.key()) @ GrpxProtocolError::UnauthorizedConfirmation,
        constraint = offer.status == OfferStatus::Accepted @ GrpxProtocolError::InvalidOfferStatus,
        seeds = [b"offer", producer.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account_b: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> ConfirmOffer<'info> {
    pub fn transfer_nft_to_consumer(&mut self) -> Result<()> {
        let seeds = &[
            b"offer",
            self.producer.to_account_info().key.as_ref(),
            &self.offer.id.to_le_bytes()[..],
            &[self.offer.bump],
        ];
        let signer_seeds = [&seeds[..]];

        let accounts = TransferChecked {
            from: self.vault_token_account_a.to_account_info(),
            mint: self.token_mint_a.to_account_info(),
            to: self.consumer_token_account_a.to_account_info(),
            authority: self.offer.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            &signer_seeds,
        );

        transfer_checked(
            cpi_context,
            self.vault_token_account_a.amount,
            self.token_mint_a.decimals,
        )?;

        self.offer.status = OfferStatus::Accepted;
        self.offer.consumer = Some(self.consumer.key());

        Ok(())
    }

    pub fn transfer_sol_to_producer(&mut self) -> Result<()> {
        let seeds = &[
            b"offer",
            self.producer.to_account_info().key.as_ref(),
            &self.offer.id.to_le_bytes()[..],
            &[self.offer.bump],
        ];
        let signer_seeds = [&seeds[..]];

        let accounts = TransferChecked {
            from: self.vault_token_account_b.to_account_info(),
            mint: self.token_mint_b.to_account_info(),
            to: self.producer_token_account_b.to_account_info(),
            authority: self.offer.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            &signer_seeds,
        );

        transfer_checked(
            cpi_context,
            self.vault_token_account_b.amount,
            self.token_mint_b.decimals,
        )?;

        Ok(())
    }

    pub fn close_vaults(&mut self) -> Result<()> {
        let seeds = &[
            b"offer",
            self.producer.to_account_info().key.as_ref(),
            &self.offer.id.to_le_bytes()[..],
            &[self.offer.bump],
        ];
        let signer_seeds = [&seeds[..]];

        let producer_accounts = CloseAccount {
            account: self.vault_token_account_a.to_account_info(),
            destination: self.consumer.to_account_info(),
            authority: self.offer.to_account_info(),
        };
        let producer_cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            producer_accounts,
            &signer_seeds,
        );

        let consumer_accounts = CloseAccount {
            account: self.vault_token_account_b.to_account_info(),
            destination: self.consumer.to_account_info(),
            authority: self.offer.to_account_info(),
        };
        let consumer_cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            consumer_accounts,
            &signer_seeds,
        );

        close_account(producer_cpi_context)?;
        close_account(consumer_cpi_context)?;
        self.offer.status = OfferStatus::Completed;

        Ok(())
    }
}
