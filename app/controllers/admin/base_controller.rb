# frozen_string_literal: true

module Admin
  class BaseController < ApplicationController
    include Authorization
    include AccountableConcern

    layout 'admin'

    before_action :require_staff!
<<<<<<< HEAD
    before_action :set_body_classes

    private

    def set_body_classes
      @body_classes = 'admin'
=======
    before_action :set_pack

    def set_pack
      use_pack 'admin'
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
    end
  end
end
