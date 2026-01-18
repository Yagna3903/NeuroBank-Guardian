from datetime import datetime

MOCK_USERS = [
    {
        "user_id": "user_001",
        "name": "Om Solanki",
        "email": "emailtosolankiom@gmail.com",
        "phone": "+1-416-555-0101",
        "risk_score": 95,
        "accounts": [
            {
                "account_id": "acc_001_chq",
                "type": "Chequing",
                "balance": 2450.50,
                "currency": "CAD"
            },
            {
                "account_id": "acc_001_sav",
                "type": "Savings",
                "balance": 15000.00,
                "currency": "CAD"
            }
        ],
        "loans": [
            {
                "loan_id": "loan_001_mtg",
                "type": "Mortgage",
                "original_amount": 350000.00,
                "remaining_balance": 125000.00,
                "interest_rate": 3.45,
                "next_payment_date": datetime(2025, 11, 1)
            }
        ],
        "credit_cards": [
            {
                "card_id": "cc_001_visa",
                "limit": 5000.00,
                "current_balance": 450.00,
                "due_date": datetime(2025, 10, 25)
            }
        ]
    },
    {
        "user_id": "user_002",
        "name": "Yagna Patel",
        "email": "yagna3903@gmail.com",
        "phone": "+1-647-555-0199",
        "risk_score": 88,
        "accounts": [
            {
                "account_id": "acc_002_chq",
                "type": "Chequing",
                "balance": 5800.00,
                "currency": "CAD"
            }
        ],
        "loans": [],
        "credit_cards": [
             {
                "card_id": "cc_002_mc",
                "limit": 5000.00,
                "current_balance": 1200.00,
                "due_date": datetime(2025, 10, 20)
            }
        ]
    },
    {
        "user_id": "user_003",
        "name": "Sarisha",
        "email": "tn24vy@brocku.ca",
        "phone": "+1-647-555-0200",
        "risk_score": 92,
        "accounts": [
            {
                "account_id": "acc_003_chq",
                "type": "Chequing",
                "balance": 3200.00,
                "currency": "CAD"
            }
        ],
        "loans": [],
        "credit_cards": []
    }
]

MOCK_TRANSACTIONS = [
    {
        "user_id": "user_001",
        "amount": 150.00,
        "merchant": "Hydro One",
        "date": datetime(2025, 10, 1),
        "category": "Utilities",
        "description": "Monthly electricity bill payment for October."
    },
    {
        "user_id": "user_001",
        "amount": 45.50,
        "merchant": "Metro",
        "date": datetime(2025, 10, 3),
        "category": "Groceries",
        "description": "Weekly grocery shopping, fresh produce and milk."
    },
    {
        "user_id": "user_002",
        "amount": 500.00,
        "merchant": "Unknown Caller Gift Cards",
        "date": datetime(2025, 10, 5),
        "category": "Suspicious",
        "description": "Purchase of $500 in Google Play gift cards requested by phone caller claiming to be CRA."
    },
    {
        "user_id": "user_002",
        "amount": 1200.00,
        "merchant": "Landlord Corp",
        "date": datetime(2025, 10, 1),
        "category": "Rent",
        "description": "Monthly rent payment for Apartment 4B."
    },
    {
        "user_id": "user_003",
        "amount": 15.99,
        "merchant": "Netflix",
        "date": datetime(2025, 10, 15),
        "category": "Subscription",
        "description": "Monthly streaming subscription fee."
    },
    {
        "user_id": "user_004",
        "amount": 89.99,
        "merchant": "Shoppers Drug Mart",
        "date": datetime(2025, 10, 10),
        "category": "Health",
        "description": "Prescription medication and vitamins."
    },
    {
        "user_id": "user_005",
        "amount": 2500.00,
        "merchant": "Best Buy",
        "date": datetime(2025, 9, 28),
        "category": "Electronics",
        "description": "Purchase of a new laptop for grandson."
    }
]
