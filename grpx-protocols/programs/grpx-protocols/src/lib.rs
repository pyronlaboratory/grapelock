use anchor_lang::prelude::*;

declare_id!("5rX13kKwWXDSbJjbsyZH4RYzwVc4kQed8ZgBgx7f3wJV");

#[program]
pub mod grpx_protocols {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
