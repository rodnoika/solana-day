use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, MintTo, Burn};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dca_vault {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        period_seconds: u64,
        fee_bps: u16,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.admin = ctx.accounts.admin.key();
        vault.usdc_mint = ctx.accounts.usdc_mint.key();
        vault.target_mint = ctx.accounts.target_mint.key();
        vault.shares_mint = ctx.accounts.shares_mint.key();
        vault.period_seconds = period_seconds;
        vault.next_exec_ts = Clock::get()?.unix_timestamp as u64;
        vault.fee_bps = fee_bps;
        vault.total_shares = 0;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, usdc_amount: u64) -> Result<()> {
        let shares_mint = &ctx.accounts.shares_mint;
        let user_shares_ata = &ctx.accounts.user_shares_ata;
        let vault_usdc_ata = &ctx.accounts.vault_usdc_ata;
        let user_usdc_ata = &ctx.accounts.user_usdc_ata;

        // Calculate shares to mint (1:1 for simplicity in MVP)
        let shares_to_mint = usdc_amount;

        // Transfer USDC from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: user_usdc_ata.to_account_info(),
                to: vault_usdc_ata.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, usdc_amount)?;

        // Mint shares to user
        let mint_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: shares_mint.to_account_info(),
                to: user_shares_ata.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
        );
        token::mint_to(mint_ctx, shares_to_mint)?;

        // Update vault total shares
        let vault = &mut ctx.accounts.vault;
        vault.total_shares += shares_to_mint;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, shares_amount: u64) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let shares_mint = &ctx.accounts.shares_mint;
        let user_shares_ata = &ctx.accounts.user_shares_ata;
        let vault_usdc_ata = &ctx.accounts.vault_usdc_ata;
        let user_usdc_ata = &ctx.accounts.user_usdc_ata;
        let vault_target_ata = &ctx.accounts.vault_target_ata;
        let user_target_ata = &ctx.accounts.user_target_ata;

        // Calculate proportional assets to withdraw
        let total_shares = vault.total_shares;
        let usdc_to_withdraw = (shares_amount * vault_usdc_ata.amount) / total_shares;
        let target_to_withdraw = (shares_amount * vault_target_ata.amount) / total_shares;

        // Burn user's shares
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: shares_mint.to_account_info(),
                from: user_shares_ata.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_ctx, shares_amount)?;

        // Transfer USDC from vault to user
        let vault_key = vault.key();
        let vault_bump = ctx.bumps.vault;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", vault_key.as_ref(), &[vault_bump]]];
        let transfer_usdc_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: vault_usdc_ata.to_account_info(),
                to: user_usdc_ata.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_usdc_ctx, usdc_to_withdraw)?;

        // Transfer target tokens from vault to user (if any)
        if target_to_withdraw > 0 {
            let transfer_target_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: vault_target_ata.to_account_info(),
                    to: user_target_ata.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer_seeds,
            );
            token::transfer(transfer_target_ctx, target_to_withdraw)?;
        }

        // Update vault total shares
        let vault = &mut ctx.accounts.vault;
        vault.total_shares -= shares_amount;

        Ok(())
    }

    pub fn execute_dca(ctx: Context<ExecuteDca>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let current_time = Clock::get()?.unix_timestamp as u64;
        
        // Update next execution timestamp
        vault.next_exec_ts = current_time + vault.period_seconds;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub usdc_mint: Account<'info, Mint>,
    pub target_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = vault,
        seeds = [b"shares_mint"],
        bump
    )]
    pub shares_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub shares_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = shares_mint,
        associated_token::authority = user
    )]
    pub user_shares_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = vault.usdc_mint,
        associated_token::authority = vault
    )]
    pub vault_usdc_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = vault.usdc_mint,
        associated_token::authority = user
    )]
    pub user_usdc_ata: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub shares_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = shares_mint,
        associated_token::authority = user
    )]
    pub user_shares_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = vault.usdc_mint,
        associated_token::authority = vault
    )]
    pub vault_usdc_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = vault.usdc_mint,
        associated_token::authority = user
    )]
    pub user_usdc_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = vault.target_mint,
        associated_token::authority = vault
    )]
    pub vault_target_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = vault.target_mint,
        associated_token::authority = user
    )]
    pub user_target_ata: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ExecuteDca<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub admin: Pubkey,
    pub usdc_mint: Pubkey,
    pub target_mint: Pubkey,
    pub shares_mint: Pubkey,
    pub period_seconds: u64,
    pub next_exec_ts: u64,
    pub fee_bps: u16,
    pub total_shares: u64,
}
