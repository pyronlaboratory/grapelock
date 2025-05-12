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
pub struct RefundOffer<'info> {
    #[account(mut)]
    pub producer: SystemAccount<'info>,

    #[account(mut)]
    pub consumer: SystemAccount<'info>,

    #[account(mut, constraint = (
        initiator.key() == producer.key() || 
        initiator.key() == consumer.key()
    ) @ GrpxProtocolError::UnauthorizedRefund)]
    pub initiator: Signer<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,

    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = producer,
        associated_token::token_program = token_program,
    )]
    pub producer_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = consumer,
        associated_token::token_program = token_program,
    )]
    pub consumer_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        close = initiator,
        has_one = producer,
        has_one = token_mint_a,
        has_one = token_mint_b,
        constraint = (offer.status == OfferStatus::Created || offer.status == OfferStatus::Accepted) @ GrpxProtocolError::InvalidOfferStatus,
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
    pub vault_token_account_b: Option<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> RefundOffer<'info> {
    pub fn process_refund(&mut self) -> Result<()> {
        match self.offer.status {
            OfferStatus::Created => {
                self.return_nft_to_producer()?;
            },
            OfferStatus::Accepted => {
                self.return_nft_to_producer()?;
                if let Some(vault_token_b) = &self.vault_token_account_b {
                    if vault_token_b.amount > 0 {
                        self.return_sol_to_consumer()?;
                    }
                }
            },
            _ => {
                return Err(GrpxProtocolError::InvalidOfferStatus.into())
            }
        }
        
        Ok(())
    }
    
    pub fn return_nft_to_producer(&mut self) -> Result<()> {
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
            to: self.producer_token_account_a.to_account_info(),
            authority: self.offer.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(self.token_program.to_account_info(), accounts, &signer_seeds);
        
        transfer_checked(
            cpi_context,
            self.vault_token_account_a.amount,
            self.token_mint_a.decimals,
        )?;

        Ok(())
    }

    pub fn return_sol_to_consumer(&mut self) -> Result<()> {
        let vault_token_b = self.vault_token_account_b.as_ref().unwrap();
        
        if vault_token_b.amount == 0 {
            return Ok(())
        }

        let seeds = &[
            b"offer",
            self.producer.to_account_info().key.as_ref(),
            &self.offer.id.to_le_bytes()[..],
            &[self.offer.bump],
        ];
        let signer_seeds = [&seeds[..]];

        let accounts = TransferChecked {
            from: vault_token_b.to_account_info(),
            mint: self.token_mint_b.to_account_info(),
            to: self.consumer_token_account_b.to_account_info(),
            authority: self.offer.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            &signer_seeds,
        );

        transfer_checked(
            cpi_context,
            vault_token_b.amount,
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
            destination: self.initiator.to_account_info(),
            authority: self.offer.to_account_info(),
        };
        let producer_cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            producer_accounts,
            &signer_seeds,
        );
        close_account(producer_cpi_context)?;

        if self.offer.status == OfferStatus::Accepted {
            if let Some(vault_token_b) = &self.vault_token_account_b {
                let consumer_accounts = CloseAccount {
                    account: vault_token_b.to_account_info(),
                    destination: self.initiator.to_account_info(),
                    authority: self.offer.to_account_info()
                };

                let consumer_cpi_context = CpiContext::new_with_signer(self.token_program.to_account_info(), consumer_accounts, &signer_seeds);
                close_account(consumer_cpi_context)?;
            }
        }

        self.offer.status = OfferStatus::Refunded;

        Ok(())
    }
}
