class AddRegexToAccounts < ActiveRecord::Migration[5.2]
  def change
    add_column :accounts, :regex, :string
  end
end
