from datetime import datetime
from repositories.user_repository import UserRepository
from services.websocket_manager import manager
import asyncio

from services.embedding_service import EmbeddingService

class AgentService:
    @staticmethod
    def calculate_live_balance(current: float, amount: float, operation: str = "subtract") -> float:
        """
        Real-time Math Calculator Function for financial operations.
        Acts as a secure logic layer before database commitments.
        """
        if operation == "subtract":
            return round(current - amount, 2)
        elif operation == "add":
            return round(current + amount, 2)
        return current

    @staticmethod
    async def get_suggestions(user_id: str):
        repo = UserRepository()
        user = repo.get_user(user_id)
        if not user:
            return []
        
        suggestions = []
        
        # 1. Unpaid Bills Logic
        if "bills" in user:
            for bill in user["bills"]:
                if bill["status"] == "Unpaid":
                    suggestions.append({
                        "id": f"pay_bill_{bill['bill_id']}",
                        "type": "PAY_BILL",
                        "title": f"Pay {bill['merchant']} Bill",
                        "description": f"Due on {bill['due_date'].strftime('%b %d')}. Amount: ${bill['amount']}",
                        "amount": bill["amount"],
                        "merchant": bill["merchant"],
                        "bill_id": bill["bill_id"],
                        "priority": "HIGH"
                    })

        # 2. Credit Card Payment Logic
        if "credit_cards" in user:
            for cc in user["credit_cards"]:
                if cc["current_balance"] > 0:
                    suggestions.append({
                        "id": f"pay_cc_{cc['card_id']}",
                        "type": "PAY_CC",
                        "title": f"Pay Off {cc['name']}",
                        "description": f"Current Balance: ${cc['current_balance']}",
                        "amount": cc["current_balance"],
                        "card_id": cc["card_id"],
                        "priority": "MEDIUM"
                    })

        return suggestions

    @staticmethod
    async def execute_action(user_id: str, action_payload: dict):
        repo = UserRepository()
        user = repo.get_user(user_id)
        if not user:
            return {"status": "error", "message": "User not found"}

        # Simulate processing delay for "Agentic Realism" - REMOVED for speed
        # await asyncio.sleep(1.5)

        action_type = action_payload.get("type")
        amount = float(action_payload.get("amount", 0))
        
        # 1. Determine Source Account
        source_type = "Chequing"
        if action_type == "TRANSFER":
             target_type = action_payload.get("to_account_type", "Savings")
             if "chequing" in target_type.lower():
                 source_type = "Savings"
        
        source_acc = next((acc for acc in user["accounts"] if source_type.lower() in acc["type"].lower()), None)
        if not source_acc:
            return {"status": "error", "message": f"Source account {source_type} not found"}
            
        if source_acc["balance"] < amount:
             return {"status": "error", "message": f"Insufficient funds in {source_type}"}

        # 2. Math Calculation (Real-Time Cache) - Deduct from Source
        new_source_balance = AgentService.calculate_live_balance(source_acc["balance"], amount, "subtract")
        source_acc["balance"] = new_source_balance
        
        updated_accounts = [source_acc.copy()] # Start with source account
        updated_credit_cards = []
        
        # 3. Handle Action Types
        # If it was a bill, mark as paid
        if action_type == "PAY_BILL":
             bill_id = action_payload.get("bill_id")
             if "bills" in user:
                 for b in user["bills"]:
                     if b["bill_id"] == bill_id:
                         b["status"] = "Paid"

        # If paying Credit Card
        elif action_type == "PAY_CC":
             card_id = action_payload.get("card_id")
             if "credit_cards" in user:
                 for cc in user["credit_cards"]:
                     if cc["card_id"] == card_id:
                         # Deduct amount from CC Balance
                         cc["current_balance"] = max(0, round(cc["current_balance"] - amount, 2)) 
                         
                         cc_copy = cc.copy()
                         if isinstance(cc_copy.get("due_date"), datetime):
                             cc_copy["due_date"] = cc_copy["due_date"].isoformat()
                         updated_credit_cards.append(cc_copy)

        # INTERNAL TRANSFER LOGIC
        elif action_type == "TRANSFER":
            target_type = action_payload.get("to_account_type", "").lower()
            
            # Find destination account
            dest_acc = next((acc for acc in user["accounts"] if target_type in acc["type"].lower()), None)
            
            if dest_acc:
                # Math Add to Destination
                new_dest_balance = AgentService.calculate_live_balance(dest_acc["balance"], amount, "add")
                dest_acc["balance"] = new_dest_balance
                updated_accounts.append(dest_acc.copy())
            else:
                return {"status": "error", "message": f"Destination account '{target_type}' not found"}

        # 4. Vector Database Update (RAG Sync)
        embedding_service = EmbeddingService()
        transaction_record = {
            "date": datetime.now().isoformat(),
            "merchant": action_payload.get("merchant", "Agent Action"),
            "amount": amount,
            "category": "Bill Payment" if action_type == "PAY_BILL" else "Debt Repayment",
            "description": f"Agent executed action: {action_payload.get('title')}"
        }
        await embedding_service.add_to_vector_store(transaction_record)

        # Calculate True Total Balance (Sum of all liquid accounts)
        new_total_balance = round(sum(acc["balance"] for acc in user["accounts"]), 2)
        
        # Get Chequing Balance for legacy field
        chequing_ref = next((acc for acc in user["accounts"] if "chequing" in acc["type"].lower()), None)
        new_chequing_balance = chequing_ref["balance"] if chequing_ref else 0

        # 5. Push Granular Real-Time Update
        await manager.send_personal_message({
            "type": "full_state_update", 
            "new_total_balance": new_total_balance,
            "new_chequing_balance": new_chequing_balance,
            "updated_accounts": updated_accounts, 
            "updated_credit_cards": updated_credit_cards, 
            "latest_transaction": transaction_record,
            "agent_message": f"Successfully executed: {action_payload.get('title')}"
        }, user_id)

        return {"status": "success", "new_balance": new_total_balance}
