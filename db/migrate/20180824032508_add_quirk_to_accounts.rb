class AddQuirkToAccounts < ActiveRecord::Migration[5.2]
  def change
    add_column :accounts, :quirk, :string
  end
end
